<?php
session_start();
require_once '../../config/database.php';
require_once '../../includes/auth.php';

requireAdmin();

header('Content-Type: application/json');

try {
    $recent_orders = $pdo->query("
        SELECT o.*, u.username, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 10
    ")->fetchAll();

    $html = '';
    foreach($recent_orders as $order) {
        $status_class = $order['status'] == 'completed' ? 'success' : ($order['status'] == 'pending' ? 'warning' : 'danger');
        $html .= "<tr>
            <td>#{$order['id']}</td>
            <td>
                " . htmlspecialchars($order['username']) . "
                <br><small class='text-muted'>" . htmlspecialchars($order['email']) . "</small>
            </td>
            <td>KSh " . number_format($order['total_amount']) . "</td>
            <td>
                <span class='badge bg-{$status_class}'>
                    " . ucfirst($order['status']) . "
                </span>
            </td>
            <td>" . date('M j, Y', strtotime($order['created_at'])) . "</td>
            <td>
                <a href='orders.php?id={$order['id']}' class='btn btn-sm btn-outline-primary'>
                    <i class='fas fa-eye'></i>
                </a>
            </td>
        </tr>";
    }

    echo json_encode(['html' => $html]);
} catch(Exception $e) {
    echo json_encode(['error' => 'Failed to fetch orders']);
}