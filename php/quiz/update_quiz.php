<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'ecole') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

$quizId = $_POST['quiz_id'] ?? null;
$title = $_POST['title'] ?? '';
$questions = $_POST['questions'] ?? [];
$points = $_POST['points'] ?? [];

if (!$quizId || empty($title) || empty($questions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
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
            // Mettre à jour le quiz
            $quizData['title'] = $title;
            $quizData['questions'] = [];

            foreach ($questions as $index => $questionText) {
                $optionsKey = "options_" . $index;
                $correctAnswerKey = "correct_answer_" . $index;
                
                $options = $_POST[$optionsKey] ?? [];
                $correctAnswer = $_POST[$correctAnswerKey] ?? null;
                
                if (!empty($options) && isset($correctAnswer)) {
                    $quizData['questions'][] = [
                        'question' => $questionText,
                        'points' => $points[$index] ?? 1,
                        'options' => $options,
                        'correct_answer' => (int)$correctAnswer
                    ];
                }
            }
            
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