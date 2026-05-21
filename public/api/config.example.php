<?php

return [
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=tennis;charset=utf8mb4',
        'user' => 'database_user',
        'password' => 'database_password',
    ],
    'admin' => [
        'username' => 'Andreas',
        // Generate with: php -r "echo password_hash('your-password', PASSWORD_DEFAULT), PHP_EOL;"
        'password_hash' => '$2y$10$replace-this-with-your-password-hash',
        // Alternative if you cannot generate a PHP password_hash:
        // Generate with: node -e "console.log(require('crypto').createHash('sha256').update('your-password').digest('hex'))"
        'password_sha256' => '',
    ],
];
