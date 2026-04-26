<?php

error_reporting(E_ALL);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function json_response(array $payload, int $status = 200)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status)
{
    json_response(['error' => $message], $status);
}

function config(): array
{
    $paths = [
        __DIR__ . '/private/config.php',
        __DIR__ . '/config.php',
    ];
    $path = null;

    foreach ($paths as $candidate) {
        if (is_file($candidate)) {
            $path = $candidate;
            break;
        }
    }

    if ($path === null) {
        json_error('API config.php fehlt. Erwartet in api/private/config.php oder api/config.php.', 500);
    }

    $config = require $path;
    if (!is_array($config)) {
        json_error('API config.php ist ungueltig.', 500);
    }

    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = config()['db'] ?? [];
    $dsn = (string) ($db['dsn'] ?? '');
    $user = (string) ($db['user'] ?? '');

    if ($dsn === '' || $user === '') {
        json_error('Datenbank-Konfiguration ist unvollstaendig: db.dsn und db.user muessen gesetzt sein.', 500);
    }

    try {
        $pdo = new PDO($dsn, $user, (string) ($db['password'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS tournaments (
                slug VARCHAR(120) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                state_json LONGTEXT NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
        );
    } catch (Throwable $error) {
        json_error('Datenbankfehler: ' . $error->getMessage(), 500);
    }

    return $pdo;
}

function request_json(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Ungueltige JSON-Anfrage.', 400);
    }
    return $data;
}

function slug_from_request(?string $value): string
{
    $slug = strtolower(trim((string) $value));
    if (!preg_match('/^[a-z0-9-]{1,120}$/', $slug)) {
        json_error('Ungueltiger Turnier-Slug.', 400);
    }
    return $slug;
}

function current_admin(): ?string
{
    return isset($_SESSION['admin_user']) ? (string) $_SESSION['admin_user'] : null;
}

function require_admin(): string
{
    $user = current_admin();
    if ($user === null) {
        json_error('Nicht eingeloggt.', 401);
    }
    return $user;
}

function tournament_payload(array $row): array
{
    $state = json_decode((string) $row['state_json'], true);
    if (!is_array($state)) {
        $state = [];
    }

    return [
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'updatedAt' => (string) $row['updated_at'],
        'state' => $state,
    ];
}

function find_tournament(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, title, state_json, updated_at FROM tournaments WHERE slug = ?');
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    return is_array($row) ? tournament_payload($row) : null;
}
