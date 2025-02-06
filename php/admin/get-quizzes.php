<?php
session_start();

// Vérifier si l'utilisateur est connecté et est admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

header('Content-Type: application/json');

// Chemin vers le fichier quizzes.txt
$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

try {
    // Vérifier si le fichier existe
    if (!file_exists($quizzesFile)) {
        // Si le fichier n'existe pas, renvoyer un tableau vide
        echo json_encode([]);
        exit;
    }

    // Lire le fichier
    $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    $quizData = [];

    foreach ($quizzes as $quiz) {
        $quizObj = json_decode($quiz, true);
        if ($quizObj) {
            $quizData[] = $quizObj;
        }
    }

    // Trier par date de création (du plus récent au plus ancien)
    usort($quizData, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode($quizData);

} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}