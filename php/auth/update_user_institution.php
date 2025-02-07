<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$institutionType = $data['institutionType'] ?? '';
$institutionId = $data['institutionId'] ?? '';

if (empty($institutionType) || empty($institutionId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$usersFile = __DIR__ . '/../../data/users.txt';

try {
    if (!file_exists($usersFile)) {
        throw new Exception('Fichier utilisateurs non trouvé');
    }

    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $updated = false;
    $institutionInfo = null;

    // Trouver d'abord l'institution
    foreach ($users as $user) {
        $userData = json_decode($user, true);
        if ($userData['id'] === $institutionId) {
            $institutionInfo = $userData;
            break;
        }
    }

    if (!$institutionInfo) {
        throw new Exception('Institution non trouvée');
    }

    // Mettre à jour l'utilisateur
    foreach ($users as $key => $user) {
        $userData = json_decode($user, true);
        if ($userData['email'] === $_SESSION['user']['email']) {
            $userData['affiliated_institution'] = [
                'type' => $institutionType,
                'id' => $institutionId,
                'name' => $institutionType === 'ecole' ? $institutionInfo['schoolName'] : $institutionInfo['companyName']
            ];
            $users[$key] = json_encode($userData);
            $updated = true;
            
            // Mettre à jour la session
            $_SESSION['user']['affiliated_institution'] = $userData['affiliated_institution'];
            break;
        }
    }

    if ($updated) {
        file_put_contents($usersFile, implode("\n", $users) . "\n");
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Utilisateur non trouvé');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}