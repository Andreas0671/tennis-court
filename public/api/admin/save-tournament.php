<?php

require __DIR__ . '/../bootstrap.php';

require_admin();

$body = request_json();
$slug = slug_from_request($body['slug'] ?? 'clubabend');
$title = trim((string) ($body['title'] ?? 'TC Heide 1975'));
$state = $body['state'] ?? null;

if ($title === '') {
    json_error('Titel darf nicht leer sein.', 400);
}

if (!is_array($state)) {
    json_error('Turnierstatus fehlt.', 400);
}

$stateJson = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if (!is_string($stateJson)) {
    json_error('Turnierstatus konnte nicht gespeichert werden.', 400);
}

$stmt = db()->prepare(
    'INSERT INTO tournaments (slug, title, state_json)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), state_json = VALUES(state_json), updated_at = CURRENT_TIMESTAMP'
);
$stmt->execute([$slug, $title, $stateJson]);

$tournament = find_tournament($slug);
if ($tournament === null) {
    json_error('Turnier konnte nicht geladen werden.', 500);
}

json_response($tournament);
