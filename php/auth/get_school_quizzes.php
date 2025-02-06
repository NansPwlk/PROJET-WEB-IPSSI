<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

// Debug
error_log('Checking file: ' . $quizzesFile);
error_log('User email: ' . $_SESSION['user']['email']);

if (!file_exists($quizzesFile)) {
    echo json_encode([
        'success' => true,
        'quizzes' => []
    ]);
    exit;
}

try {
    $lines = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    $schoolQuizzes = [];

    foreach ($lines as $line) {
        $quizData = json_decode($line, true);
        if ($quizData && $quizData['creator_email'] === $_SESSION['user']['email']) {
            $schoolQuizzes[] = [
                'id' => $quizData['id'],
                'title' => $quizData['title'],
                'status' => $quizData['status'],
                'questions_count' => count($quizData['questions'] ?? []),
                'responses_count' => count($quizData['responses'] ?? []),
                'created_at' => $quizData['created_at']
            ];
        }
    }

    error_log('Found quizzes: ' . print_r($schoolQuizzes, true));

    echo json_encode([
        'success' => true,
        'quizzes' => $schoolQuizzes
    ]);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la récupération des quiz']);
}