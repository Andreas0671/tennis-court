<?php

require __DIR__ . '/../bootstrap.php';

json_response([
    'authenticated' => current_admin() !== null,
    'username' => current_admin(),
]);
