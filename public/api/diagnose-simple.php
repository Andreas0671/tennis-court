<?php

header('Content-Type: application/json; charset=utf-8');

$result = array(
    'ok' => false,
    'phpVersion' => PHP_VERSION,
    'pdoLoaded' => extension_loaded('pdo'),
    'pdoMysqlLoaded' => extension_loaded('pdo_mysql'),
    'configFoundPrivate' => is_file(__DIR__ . '/private/config.php'),
    'configFoundApi' => is_file(__DIR__ . '/config.php'),
);

$configPath = null;
if (is_file(__DIR__ . '/private/config.php')) {
    $configPath = __DIR__ . '/private/config.php';
} elseif (is_file(__DIR__ . '/config.php')) {
    $configPath = __DIR__ . '/config.php';
}

if ($configPath === null) {
    $result['error'] = 'Keine config.php gefunden.';
    echo json_encode($result);
    exit;
}

$config = require $configPath;
if (!is_array($config)) {
    $result['error'] = 'config.php gibt kein Array zurueck.';
    echo json_encode($result);
    exit;
}

$result['configValid'] = true;
$db = isset($config['db']) && is_array($config['db']) ? $config['db'] : array();
$dsn = isset($db['dsn']) ? (string) $db['dsn'] : '';
$user = isset($db['user']) ? (string) $db['user'] : '';
$password = isset($db['password']) ? (string) $db['password'] : '';
$result['dbConfigured'] = $dsn !== '' && $user !== '';

if (!$result['dbConfigured']) {
    $result['error'] = 'db.dsn und db.user muessen gesetzt sein.';
    echo json_encode($result);
    exit;
}

try {
    $pdo = new PDO($dsn, $user, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ));
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
} catch (Exception $error) {
    $result['error'] = $error->getMessage();
}

echo json_encode($result);
