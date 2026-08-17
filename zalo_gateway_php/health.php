<?php
header('Content-Type: application/json');

echo json_encode([
    'service' => 'fit-tour-zalo-gateway',
    'status' => 'healthy',
    'timestamp' => time()
]);
