<?php

require __DIR__ . '/../bootstrap.php';

require_admin();

$slug = slug_from_request($_GET['slug'] ?? 'clubabend');
$tournament = find_tournament($slug);

if ($tournament === null) {
    json_error('Turnier nicht gefunden.', 404);
}

json_response($tournament);
