<?php
session_start();
error_log('Session démarrée dans get_quizzes.php');
header('Content-Type: application/json');

// Debug de la session
error_log('Session user: ' . print_r($_SESSION, true));

// Vérifier si l'utilisateur est admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    error_log('Accès refusé - Role: ' . ($_SESSION['user']['role'] ?? 'non défini'));
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';
error_log('Chemin du fichier: ' . $quizzesFile);

if (!file_exists($quizzesFile)) {
    error_log('Fichier quizzes.txt non trouvé');
    echo json_encode([]);
    exit;
}

try {
    $quizzes = [];
    $lines = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    error_log('Contenu du fichier: ' . print_r($lines, true));
    
    foreach ($lines as $line) {
        if (!empty($line)) {
            $quiz = json_decode($line, true);
            if ($quiz) {
                $quizzes[] = [
                    'id' => $quiz['id'],
                    'title' => $quiz['title'],
                    'creator_name' => $quiz['creator_name'],
                    'school_name' => $quiz['school_name'] ?? '',
                    'status' => $quiz['status'],
                    'questions' => $quiz['questions'] ?? [],
                    'responses' => $quiz['responses'] ?? [],
                    'created_at' => $quiz['created_at'],
                    'isActive' => $quiz['isActive'] ?? true
                ];
            }
        }
    }

    error_log('Quiz préparés: ' . print_r($quizzes, true));
    echo json_encode($quizzes);
} catch (Exception $e) {
    error_log('Erreur dans get_quizzes.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la récupération des quiz']);
}