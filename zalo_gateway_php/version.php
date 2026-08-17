<?php
header('Content-Type: application/json');

echo json_encode([
    'service' => 'fit-tour-zalo-gateway',
    'version' => '1.0.0',
    'environment' => 'production'
]);
