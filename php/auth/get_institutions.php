<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$type = $_GET['type'] ?? '';

if (!in_array($type, ['ecole', 'entreprise'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Type d\'institution invalide']);
    exit;
}

$usersFile = __DIR__ . '/../../data/users.txt';

try {
    if (!file_exists($usersFile)) {
        throw new Exception('Fichier utilisateurs non trouvé');
    }

    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $institutions = [];

    foreach ($users as $user) {
        $userData = json_decode($user, true);
        
        if ($userData['role'] === $type) {
            if ($type === 'ecole' && isset($userData['schoolName'])) {
                $institutions[] = [
                    'id' => $userData['id'],
                    'schoolName' => $userData['schoolName'],
                    'schoolCity' => $userData['schoolCity']
                ];
            } elseif ($type === 'entreprise' && isset($userData['companyName'])) {
                $institutions[] = [
                    'id' => $userData['id'],
                    'companyName' => $userData['companyName'],
                    'activityDomain' => $userData['activityDomain']
                ];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'institutions' => $institutions
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}