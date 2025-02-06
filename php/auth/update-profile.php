<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Méthode non autorisée']));
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user']['id'] ?? '';

// Validation des champs
if (empty($data['firstname']) || strlen($data['firstname']) < 2) {
    http_response_code(400);
    exit(json_encode(['error' => 'Le prénom doit contenir au moins 2 caractères']));
}

if (empty($data['lastname']) || strlen($data['lastname']) < 2) {
    http_response_code(400);
    exit(json_encode(['error' => 'Le nom doit contenir au moins 2 caractères']));
}

if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Email invalide']));
}

// Validation du mot de passe si fourni
if (!empty($data['password'])) {
    if (strlen($data['password']) < 8 || 
        !preg_match('/[A-Z]/', $data['password']) || 
        !preg_match('/[a-z]/', $data['password']) || 
        !preg_match('/[0-9]/', $data['password']) || 
        !preg_match('/[^A-Za-z0-9]/', $data['password'])) {
        http_response_code(400);
        exit(json_encode(['error' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial']));
    }
}

// Lecture et mise à jour du fichier users.txt
$usersFile = __DIR__ . '/../../data/users.txt';
$users = file($usersFile, FILE_IGNORE_NEW_LINES);
$userIndex = -1;

// Vérification de l'email unique
foreach ($users as $index => $user) {
    $userData = json_decode($user, true);
    if ($userData['id'] === $userId) {
        $userIndex = $index;
    } elseif ($userData['email'] === $data['email']) {
        http_response_code(400);
        exit(json_encode(['error' => 'Cet email est déjà utilisé']));
    }
}

if ($userIndex === -1) {
    http_response_code(404);
    exit(json_encode(['error' => 'Utilisateur non trouvé']));
}

// Mise à jour des données
$userData = json_decode($users[$userIndex], true);
$userData['firstname'] = $data['firstname'];
$userData['lastname'] = $data['lastname'];
$userData['email'] = $data['email'];

if (!empty($data['password'])) {
    $userData['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
}

// Sauvegarde des modifications
$users[$userIndex] = json_encode($userData);
file_put_contents($usersFile, implode("\n", $users));

// Mise à jour de la session
$_SESSION['user']['firstname'] = $userData['firstname'];
$_SESSION['user']['lastname'] = $userData['lastname'];
$_SESSION['user']['email'] = $userData['email'];

echo json_encode(['success' => true]);
