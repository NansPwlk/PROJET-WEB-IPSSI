<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$quizId = $data['quiz_id'] ?? null;

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
    $updated = false;
    $newQuizzes = [];

    foreach ($quizzes as $quiz) {
        $quizData = json_decode($quiz, true);
        if ($quizData['id'] === $quizId && $quizData['creator_email'] === $_SESSION['user']['email']) {
            $quizData['status'] = 'active';
            $updated = true;
            $newQuizzes[] = json_encode($quizData);
        } else {
            $newQuizzes[] = $quiz;
        }
    }

    if (!$updated) {
        throw new Exception('Quiz non trouvé');
    }

    file_put_contents($quizzesFile, implode("\n", $newQuizzes) . "\n");
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}