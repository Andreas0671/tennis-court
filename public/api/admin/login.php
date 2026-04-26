<?php

require __DIR__ . '/../bootstrap.php';

$body = request_json();
$admin = config()['admin'] ?? [];
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');
$expectedUser = (string) ($admin['username'] ?? '');
$passwordHash = (string) ($admin['password_hash'] ?? '');
$passwordSha256 = (string) ($admin['password_sha256'] ?? '');

$validPassword = $passwordHash !== '' && password_verify($password, $passwordHash);
if (!$validPassword && $passwordSha256 !== '') {
    $validPassword = hash_equals($passwordSha256, hash('sha256', $password));
}

if (!hash_equals($expectedUser, $username) || !$validPassword) {
    json_error('Benutzername oder Passwort ist falsch.', 401);
}

session_regenerate_id(true);
$_SESSION['admin_user'] = $expectedUser;

json_response(['username' => $expectedUser]);
