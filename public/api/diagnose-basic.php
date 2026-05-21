<?php

header('Content-Type: text/plain; charset=utf-8');

echo "diagnose basic ok\n";
echo "PHP_VERSION=" . PHP_VERSION . "\n";
echo "PDO_LOADED=" . (extension_loaded('pdo') ? 'yes' : 'no') . "\n";
echo "PDO_MYSQL_LOADED=" . (extension_loaded('pdo_mysql') ? 'yes' : 'no') . "\n";

$privateConfig = __DIR__ . '/private/config.php';
$apiConfig = __DIR__ . '/config.php';

echo "PRIVATE_CONFIG_EXISTS=" . (is_file($privateConfig) ? 'yes' : 'no') . "\n";
echo "API_CONFIG_EXISTS=" . (is_file($apiConfig) ? 'yes' : 'no') . "\n";

if (is_file($privateConfig)) {
    echo "PRIVATE_CONFIG_READABLE=" . (is_readable($privateConfig) ? 'yes' : 'no') . "\n";
    echo "PRIVATE_CONFIG_SIZE=" . filesize($privateConfig) . "\n";
    $firstBytes = file_get_contents($privateConfig, false, null, 0, 80);
    echo "PRIVATE_CONFIG_START=" . str_replace(array("\r", "\n"), array("\\r", "\\n"), (string) $firstBytes) . "\n";
}
