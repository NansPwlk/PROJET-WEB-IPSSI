<?php
session_start();
header('Content-Type: application/json');

// Vérifier l'authentification
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Accès non autorisé']);
    exit;
}

// Récupérer les données JSON
$inputData = json_decode(file_get_contents('php://input'), true);

// Valider les données
if (!isset($inputData['quiz_id']) || !isset($inputData['responses'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données invalides']);
    exit;
}

$quizId = $inputData['quiz_id'];
$userResponses = $inputData['responses'];
$userEmail = $_SESSION['user']['email'];

// Chemins des fichiers
$quizzesFile = __DIR__ . '/../../data/quizzes.txt';
$userResponsesFile = __DIR__ . '/../../data/user_responses.txt';

try {
    // Charger le quiz
    $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    $foundQuiz = null;
    
    foreach ($quizzes as $quizLine) {
        $quizData = json_decode($quizLine, true);
        if ($quizData['id'] === $quizId) {
            $foundQuiz = $quizData;
            break;
        }
    }

    if (!$foundQuiz) {
        throw new Exception('Quiz non trouvé');
    }

    // Calculer le score
    $score = 0;
    $totalPoints = 0;

    foreach ($foundQuiz['questions'] as $index => $question) {
        // Gérer les points par défaut à 1 si non spécifié
        $points = isset($question['points']) ? intval($question['points']) : 1;
        $totalPoints += $points;
        
        // Vérifier si la réponse de l'utilisateur est correcte
        if (isset($question['correct_answer']) && 
            isset($userResponses[$index]) &&
            $userResponses[$index] === $question['correct_answer']) {
            $score += $points;
        }
    }

    // Préparer les données de réponse
    $userResponseData = [
        'user_email' => $userEmail,
        'quiz_id' => $quizId,
        'quiz_title' => $foundQuiz['title'],
        'responses' => $userResponses,
        'score' => $score,
        'total_points' => $totalPoints,
        'completed_at' => date('Y-m-d H:i:s')
    ];

    // Ajouter la réponse au fichier
    file_put_contents(
        $userResponsesFile, 
        json_encode($userResponseData) . PHP_EOL, 
        FILE_APPEND
    );

    // Répondre avec le succès et le score
    echo json_encode([
        'success' => true,
        'quiz_id' => $quizId,
        'score' => $score,
        'total_points' => $totalPoints
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la soumission du quiz : ' . $e->getMessage()
    ]);
}