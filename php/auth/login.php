<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validation basique
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email et mot de passe requis']);
    exit;
}

// Lire les utilisateurs depuis le fichier
$usersFile = __DIR__ . '/../../data/users.txt';
if (!file_exists($usersFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur système']);
    exit;
}

try {
    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $userFound = false;

    foreach ($users as $user) {
        $userData = json_decode($user, true);
        if ($userData['email'] === $email) {
            $userFound = true;

            // Vérifier si le compte est actif
            if (isset($userData['isActive']) && !$userData['isActive']) {
                http_response_code(403);
                echo json_encode(['error' => 'Compte désactivé']);
                exit;
            }

            // Vérifier le mot de passe
            if (password_verify($password, $userData['password'])) {
                // Créer la session
                $_SESSION['user'] = [
                    'id' => $userData['id'] ?? uniqid(),
                    'firstname' => $userData['firstname'],
                    'lastname' => $userData['lastname'],
                    'email' => $userData['email'],
                    'role' => $userData['role']
                ];

                // Déterminer la redirection selon le rôle
                // Déterminer la redirection selon le rôle
                $redirect = '';
                switch($userData['role']) {
                    case 'admin':
                        $redirect = '/public/admin-dashboard.html';
                        break;
                    case 'ecole':
                        $redirect = '/public/ecole-dashboard.html';
                        break;
                    case 'entreprise':
                        $redirect = '/public/entreprise-dashboard.html';
                        break;
                    case 'utilisateur':
                        $redirect = '/public/user-dashboard.html';
                }

                echo json_encode([
                    'success' => true,
                    'redirect' => $redirect,
                    'user' => $_SESSION['user']
                ]);
                exit;
            }

            // Mot de passe incorrect
            http_response_code(401);
            echo json_encode(['error' => 'Email ou mot de passe incorrect']);
            exit;
        }
    }

    // Utilisateur non trouvé
    if (!$userFound) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou mot de passe incorrect']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur système']);
    exit;
}