<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'entreprise') {
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
            'company' => [
                'companyName' => $userData['companyName'] ?? 'Non défini',
                'activityDomain' => $userData['activityDomain'] ?? 'Non défini'
            ]
        ]);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'Entreprise non trouvée']);