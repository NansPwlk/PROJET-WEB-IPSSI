<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$usersFile = __DIR__ . '/../../data/users.txt';
$users = file($usersFile, FILE_IGNORE_NEW_LINES);

foreach ($users as $user) {
    $userData = json_decode($user, true);
    if ($userData['email'] === $_SESSION['user']['email']) {
        echo json_encode([
            'success' => true,
            'school' => [
                'schoolName' => $userData['schoolName'] ?? 'Non défini',
                'schoolCity' => $userData['schoolCity'] ?? 'Non défini'
            ]
        ]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'École non trouvée']);