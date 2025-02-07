<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$usersFile = __DIR__ . '/../../data/users.txt';

try {
    if (!file_exists($usersFile)) {
        throw new Exception('Fichier utilisateurs non trouvé');
    }

    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $userData = null;

    foreach ($users as $user) {
        $data = json_decode($user, true);
        if ($data['email'] === $_SESSION['user']['email']) {
            $userData = $data;
            break;
        }
    }

    if ($userData) {
        echo json_encode([
            'success' => true,
            'user' => [
                'firstname' => $userData['firstname'],
                'lastname' => $userData['lastname'],
                'email' => $userData['email'],
                'affiliated_institution' => $userData['affiliated_institution']
            ]
        ]);
    } else {
        throw new Exception('Utilisateur non trouvé');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}