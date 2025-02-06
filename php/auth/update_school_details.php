<?php
session_start();
header('Content-Type: application/json');

// Debug pour voir ce qui arrive
error_log('Session: ' . print_r($_SESSION, true));
error_log('POST data: ' . file_get_contents('php://input'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Session non trouvée']);
    exit;
}

// Vérifier si l'utilisateur est une école
if ($_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Rôle non autorisé']);
    exit;
}

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);
$schoolName = $data['schoolName'] ?? '';
$schoolCity = $data['schoolCity'] ?? '';

if (empty($schoolName) || empty($schoolCity)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// Mettre à jour le fichier users.txt
$usersFile = __DIR__ . '/../../data/users.txt';

if (!file_exists($usersFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Fichier utilisateurs non trouvé']);
    exit;
}

$users = file($usersFile, FILE_IGNORE_NEW_LINES);
$updated = false;

foreach ($users as $key => $user) {
    $userData = json_decode($user, true);
    if ($userData['email'] === $_SESSION['user']['email']) {
        $userData['schoolName'] = $schoolName;
        $userData['schoolCity'] = $schoolCity;
        $users[$key] = json_encode($userData);
        $updated = true;
        
        // Mettre à jour la session avec les nouvelles informations
        $_SESSION['user']['schoolName'] = $schoolName;
        $_SESSION['user']['schoolCity'] = $schoolCity;
        break;
    }
}

if ($updated) {
    try {
        file_put_contents($usersFile, implode("\n", $users) . "\n");
        echo json_encode([
            'success' => true,
            'message' => 'Informations de l\'école mises à jour'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'écriture dans le fichier']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Utilisateur non trouvé']);
}