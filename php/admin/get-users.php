<?php
session_start();

// Vérifier si l'utilisateur est connecté et est admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

header('Content-Type: application/json');

// Chemin vers le fichier users.txt
$usersFile = __DIR__ . '/../../data/users.txt';

try {
    // Vérifier si le fichier existe
    if (!file_exists($usersFile)) {
        throw new Exception('Fichier utilisateurs non trouvé');
    }

    // Lire le fichier
    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $userData = [];

    foreach ($users as $user) {
        $userObj = json_decode($user, true);
        if ($userObj) {
            // Ne pas inclure le mot de passe dans la réponse
            unset($userObj['password']);
            $userData[] = $userObj;
        }
    }

    // Trier par date de création (du plus récent au plus ancien)
    usort($userData, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode($userData);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}