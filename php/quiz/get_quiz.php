<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$quizId = $_GET['id'] ?? null;

if (!$quizId) {
    http_response_code(400);
    echo json_encode(['error' => 'ID du quiz manquant']);
    exit;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

try {
    if (!file_exists($quizzesFile)) {
        throw new Exception('Quiz non trouvé');
    }

    $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    $found = false;

    foreach ($quizzes as $quiz) {
        $quizData = json_decode($quiz, true);
        if ($quizData['id'] === $quizId && $quizData['creator_email'] === $_SESSION['user']['email']) {
            echo json_encode([
                'success' => true,
                'quiz' => $quizData
            ]);
            $found = true;
            break;
        }
    }

    if (!$found) {
        throw new Exception('Quiz non trouvé');
    }
} catch (Exception $e) {
    http_response_code(404);
    echo json_encode(['error' => $e->getMessage()]);
}