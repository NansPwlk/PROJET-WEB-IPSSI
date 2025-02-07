<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'entreprise') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$companyName = $data['companyName'] ?? '';
$activityDomain = $data['activityDomain'] ?? '';

if (empty($companyName) || empty($activityDomain)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$usersFile = __DIR__ . '/../../data/users.txt';
$users = file($usersFile, FILE_IGNORE_NEW_LINES);
$updated = false;

foreach ($users as $key => $user) {
    $userData = json_decode($user, true);
    if ($userData['email'] === $_SESSION['user']['email']) {
        $userData['companyName'] = $companyName;
        $userData['activityDomain'] = $activityDomain;
        $users[$key] = json_encode($userData);
        $updated = true;
        break;
    }
}

if ($updated) {
    file_put_contents($usersFile, implode("\n", $users) . "\n");
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la mise à jour']);
}