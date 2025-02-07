<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'entreprise') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

if (!file_exists($quizzesFile)) {
    echo json_encode([
        'success' => true,
        'quizzes' => []
    ]);
    exit;
}

try {
    $quizzes = [];
    $lines = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    
    foreach ($lines as $line) {
        if (!empty($line)) {
            $quiz = json_decode($line, true);
            if ($quiz && $quiz['creator_email'] === $_SESSION['user']['email']) {
                $quizzes[] = [
                    'id' => $quiz['id'],
                    'title' => $quiz['title'],
                    'status' => $quiz['status'],
                    'questions_count' => count($quiz['questions'] ?? []),
                    'responses_count' => count($quiz['responses'] ?? []),
                    'created_at' => $quiz['created_at'],
                    'isActive' => $quiz['isActive'] ?? true,
                    'type' => $quiz['type'] ?? 'mixed' // Pour différencier les quiz avec réponses libres
                ];
            }
        }
    }

    // Trier par date de création (plus récent en premier)
    usort($quizzes, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    echo json_encode([
        'success' => true,
        'quizzes' => $quizzes
    ]);
} catch (Exception $e) {
    error_log('Erreur dans get_company_quizzes.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la récupération des quiz']);
}