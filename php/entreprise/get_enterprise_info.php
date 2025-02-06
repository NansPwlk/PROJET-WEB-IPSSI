<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id']) && $_SESSION['role'] === 'entreprise') {
    // Exemple statique
    $response = [
        'success' => true,
        'enterprise' => [
            'name' => 'Nom Entreprise Démo'
        ]
    ];
    echo json_encode($response);
} else {
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
}
?>
