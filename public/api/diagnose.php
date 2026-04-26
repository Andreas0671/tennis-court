<?php

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$configPaths = [
    __DIR__ . '/private/config.php',
    __DIR__ . '/config.php',
];

$foundConfig = null;
foreach ($configPaths as $path) {
    if (is_file($path)) {
        $foundConfig = $path;
        break;
    }
}

$result = [
    'ok' => false,
    'phpVersion' => PHP_VERSION,
    'pdoLoaded' => extension_loaded('pdo'),
    'pdoMysqlLoaded' => extension_loaded('pdo_mysql'),
    'pdoDrivers' => class_exists('PDO') ? PDO::getAvailableDrivers() : [],
    'configChecked' => $configPaths,
    'configFound' => $foundConfig,
    'configValid' => false,
    'dbConfigured' => false,
    'dbConnected' => false,
    'tableReady' => false,
];

try {
    if ($foundConfig === null) {
        throw new RuntimeException('Keine config.php gefunden. Erwartet wird api/private/config.php oder api/config.php.');
    }

    $config = require $foundConfig;
    if (!is_array($config)) {
        throw new RuntimeException('config.php gibt kein Array zurück.');
    }

    $result['configValid'] = true;
    $db = $config['db'] ?? null;
    if (!is_array($db)) {
        throw new RuntimeException('Der db-Block fehlt in config.php.');
    }

    $dsn = (string) ($db['dsn'] ?? '');
    $user = (string) ($db['user'] ?? '');
    $password = (string) ($db['password'] ?? '');
    $result['dbConfigured'] = $dsn !== '' && $user !== '';

    if (!$result['dbConfigured']) {
        throw new RuntimeException('db.dsn und db.user müssen gesetzt sein.');
    }

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $result['dbConnected'] = true;

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS tournaments (
            slug VARCHAR(120) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            state_json LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    $result['tableReady'] = true;
    $result['ok'] = true;
} catch (Throwable $error) {
    $result['error'] = $error->getMessage();
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
