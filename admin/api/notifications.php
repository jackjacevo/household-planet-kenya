<?php
session_start();
require_once '../../config/database.php';
require_once '../../includes/auth.php';

requireAdmin();

header('Content-Type: application/json');

try {
    // Check for new orders in the last 5 minutes
    $new_orders = $pdo->query("
        SELECT COUNT(*) 
        FROM orders 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    ")->fetchColumn();

    // Check for low stock alerts
    $low_stock_count = $pdo->query("
        SELECT COUNT(*) 
        FROM products 
        WHERE stock_quantity <= 10 AND status = 'active'
    ")->fetchColumn();

    echo json_encode([
        'new_orders' => $new_orders,
        'low_stock' => $low_stock_count
    ]);
} catch(Exception $e) {
    echo json_encode(['error' => 'Failed to fetch notifications']);
}