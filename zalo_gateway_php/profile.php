<?php
header('Content-Type: application/json');
require_once 'config.php';

// Chỉ nhận POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$headers = getallheaders();
$timestamp = $headers['X-Gateway-Timestamp'] ?? null;
$signature = $headers['X-Gateway-Signature'] ?? null;
$accessToken = $headers['X-Zalo-Access-Token'] ?? null;

// Lấy Payload
$json = file_get_contents('php://input');
$data = json_decode($json, true);
$uid = $data['uid'] ?? null;

if (!$timestamp || !$signature || !$accessToken || !$uid) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required headers or uid']);
    exit;
}

// 1. Kiểm tra Timestamp (chống replay attack trong vòng 60 giây)
$now = time();
if (abs($now - $timestamp) > 60) {
    http_response_code(401);
    echo json_encode(['error' => 'Timestamp expired']);
    exit;
}

// 2. Xác thực HMAC-SHA256 Signature
$payload = $timestamp . $uid;
$expectedSignature = hash_hmac('sha256', $payload, GATEWAY_SHARED_SECRET);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// 3. Gọi Zalo API V3
$ch = curl_init();
$url = 'https://openapi.zalo.me/v3.0/oa/user/detail?data=' . urlencode(json_encode(['user_id' => $uid]));

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'access_token: ' . $accessToken
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'CURL Request Error', 'details' => $error]);
    exit;
}
curl_close($ch);

// Chuyển tiếp HTTP Code và nội dung JSON từ Zalo
http_response_code($httpCode);
echo $response;
