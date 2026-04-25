<?php

require __DIR__ . '/../bootstrap.php';

$body = request_json();
$admin = config()['admin'] ?? [];
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');
$expectedUser = (string) ($admin['username'] ?? '');
$passwordHash = (string) ($admin['password_hash'] ?? '');

if (!hash_equals($expectedUser, $username) || !password_verify($password, $passwordHash)) {
    json_error('Benutzername oder Passwort ist falsch.', 401);
}

session_regenerate_id(true);
$_SESSION['admin_user'] = $expectedUser;

json_response(['username' => $expectedUser]);
