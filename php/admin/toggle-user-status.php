<?php
session_start();

// Vérifier si l'utilisateur est connecté et est admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

header('Content-Type: application/json');

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données POST
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? null;
$newStatus = $data['status'] ?? null;

if (!$userId || !isset($newStatus)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// Chemin vers le fichier users.txt
$usersFile = __DIR__ . '/../../data/users.txt';

try {
    // Vérifier si le fichier existe
    if (!file_exists($usersFile)) {
        throw new Exception('Fichier utilisateurs non trouvé');
    }

    // Lire tous les utilisateurs
    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $newUsers = [];
    $userFound = false;

    foreach ($users as $user) {
        $userObj = json_decode($user, true);
        if ($userObj['id'] === $userId) {
            $userObj['isActive'] = $newStatus;
            $userFound = true;
        }
        $newUsers[] = json_encode($userObj);
    }

    if (!$userFound) {
        throw new Exception('Utilisateur non trouvé');
    }

    // Réécrire le fichier avec les données mises à jour
    file_put_contents($usersFile, implode("\n", $newUsers) . "\n");

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}