<?php


header('Content-Type: application/json');
session_start();

// Vérifier la méthode de requête
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Vérifier si le CAPTCHA a été validé
if (!isset($_SESSION['captcha_validated']) || $_SESSION['captcha_validated'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'CAPTCHA non validé']);
    exit;
}

// Récupérer les données du formulaire
$userData = [
    'id' => uniqid(),  // Ajout d'un ID unique
    'firstname' => $_POST['firstname'] ?? '',
    'lastname' => $_POST['lastname'] ?? '',
    'email' => $_POST['email'] ?? '',
    'password' => password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT),
    'role' => $_POST['role'] ?? '',
    'created_at' => date('Y-m-d H:i:s'),
    'isActive' => true  // Par défaut, l'utilisateur est actif
];

// Valider les données
if (empty($userData['firstname']) || empty($userData['lastname']) || 
    empty($userData['email']) || empty($userData['password']) || 
    empty($userData['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// Fichier de stockage des utilisateurs
$usersFile = __DIR__ . '/../../data/users.txt';

// Créer le dossier data s'il n'existe pas
if (!file_exists(__DIR__ . '/../../data')) {
    mkdir(__DIR__ . '/../../data', 0755, true);
}

// Vérifier si l'email existe déjà
$existingUsers = file_exists($usersFile) ? file($usersFile, FILE_IGNORE_NEW_LINES) : [];
foreach ($existingUsers as $user) {
    $user = json_decode($user, true);
    if ($user['email'] === $userData['email']) {
        http_response_code(409);
        echo json_encode(['error' => 'Cet email est déjà utilisé']);
        exit;
    }
}

// Sauvegarder l'utilisateur
try {
    $userJson = json_encode($userData) . "\n";
    file_put_contents($usersFile, $userJson, FILE_APPEND);
    
    // Réinitialiser la session
    unset($_SESSION['captcha_validated']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Inscription réussie'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'enregistrement']);
}