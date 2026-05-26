<?php
// Simple order receiver for demo purposes.
// NOTE: This is a minimal example. For production use, secure this endpoint, add spam protection, rate limits, and use a proper mail service.

header('Content-Type: application/json');
// Allow local testing from same origin; adjust as needed for production.
header('Access-Control-Allow-Origin: *');

$raw = file_get_contents('php://input');
if (!$raw) {
    echo json_encode(['success' => false, 'error' => 'No input']);
    http_response_code(400);
    exit;
}

$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    http_response_code(400);
    exit;
}

$required = ['name', 'phone', 'location', 'liters', 'quantity', 'total'];
foreach ($required as $r) {
    if (empty($data[$r])) {
        echo json_encode(['success' => false, 'error' => "Missing $r"]);
        http_response_code(400);
        exit;
    }
}

$to = 'orders@houseofmajiwater.co.ke';
$subject = 'New HOUSE OF MAJI booking from ' . ($data['name'] ?? 'customer');
$body = "New booking:\n\n";
$body .= "Name: " . ($data['name'] ?? '') . "\n";
$body .= "Phone: " . ($data['phone'] ?? '') . "\n";
$body .= "Location: " . ($data['location'] ?? '') . "\n";
$body .= "Building: " . ($data['building'] ?? '') . "\n";
$body .= "Notes: " . ($data['notes'] ?? '') . "\n";
$body .= "Liters: " . ($data['liters'] ?? '') . "L\n";
$body .= "Quantity: " . ($data['quantity'] ?? '') . "\n";
$body .= "Payment: " . ($data['payment'] ?? '') . "\n";
$body .= "Water cost: " . ($data['waterPrice'] ?? '') . "\n";
$body .= "Delivery fee: " . ($data['deliveryFee'] ?? '') . "\n";
$body .= "Total: " . ($data['total'] ?? '') . "\n";

$headers = 'From: no-reply@houseofmajiwater.co.ke' . "\r\n" .
    'Reply-To: ' . ($data['phone'] ?? '') . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

// Try to send mail. This will work if PHP is configured with a mail transfer agent.
$sent = @mail($to, $subject, $body, $headers);
if ($sent) {
    echo json_encode(['success' => true]);
    exit;
}

// If mail fails, return failure (clients should fallback to sharing links)
http_response_code(500);
echo json_encode(['success' => false, 'error' => 'Failed to send email']);
exit;
