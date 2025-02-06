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
$quizId = $data['quizId'] ?? null;
$newStatus = $data['status'] ?? null;

if (!$quizId || !isset($newStatus)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// Chemin vers le fichier quizzes.txt
$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

try {
    // Vérifier si le fichier existe
    if (!file_exists($quizzesFile)) {
        throw new Exception('Fichier quiz non trouvé');
    }

    // Lire tous les quiz
    $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    $newQuizzes = [];
    $quizFound = false;

    foreach ($quizzes as $quiz) {
        $quizObj = json_decode($quiz, true);
        if ($quizObj['id'] === $quizId) {
            $quizObj['isActive'] = $newStatus;
            $quizFound = true;
        }
        $newQuizzes[] = json_encode($quizObj);
    }

    if (!$quizFound) {
        throw new Exception('Quiz non trouvé');
    }

    // Réécrire le fichier avec les données mises à jour
    file_put_contents($quizzesFile, implode("\n", $newQuizzes) . "\n");

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}