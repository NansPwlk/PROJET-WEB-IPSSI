<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log de débogage
file_put_contents(__DIR__ . '/debug_submit.log', 
    date('[Y-m-d H:i:s] ') . "Début de la soumission du quiz\n", 
    FILE_APPEND
);

// Vérifier l'authentification
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    file_put_contents(__DIR__ . '/debug_submit.log', 
        date('[Y-m-d H:i:s] ') . "Erreur : Utilisateur non authentifié\n", 
        FILE_APPEND
    );
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Accès non autorisé']);
    exit;
}

// Récupérer les données JSON
$inputData = json_decode(file_get_contents('php://input'), true);

// Valider les données
if (!isset($inputData['quiz_id']) || !isset($inputData['responses'])) {
    file_put_contents(__DIR__ . '/debug_submit.log', 
        date('[Y-m-d H:i:s] ') . "Erreur : Données invalides\n", 
        FILE_APPEND
    );
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données invalides']);
    exit;
}

$quizId = $inputData['quiz_id'];
$userResponses = $inputData['responses'];
$userEmail = $_SESSION['user']['email'];

// Log des informations reçues
file_put_contents(__DIR__ . '/debug_submit.log', 
    date('[Y-m-d H:i:s] ') . "Informations reçues : " . json_encode([
        'quiz_id' => $quizId,
        'user_email' => $userEmail,
        'responses_count' => count($userResponses)
    ]) . "\n", 
    FILE_APPEND
);

// Chemins des fichiers
$quizzesFile = __DIR__ . '/../../data/quizzes.txt';
$userResponsesFile = __DIR__ . '/../../data/user_responses.txt';
$usersFile = __DIR__ . '/../../data/users.txt';

try {
    // Charger les informations de l'utilisateur
    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $userInstitutionType = null;
    $userInstitutionName = null;

    foreach ($users as $userLine) {
        $userData = json_decode($userLine, true);
        if ($userData['email'] === $userEmail) {
            $userInstitutionType = $userData['affiliated_institution']['type'] ?? null;
            $userInstitutionName = $userData['affiliated_institution']['name'] ?? null;
            break;
        }
    }

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
        file_put_contents(__DIR__ . '/debug_submit.log', 
            date('[Y-m-d H:i:s] ') . "Erreur : Quiz non trouvé\n", 
            FILE_APPEND
        );
        throw new Exception('Quiz non trouvé');
    }

    // Log des informations du quiz et de l'utilisateur
    file_put_contents(__DIR__ . '/debug_submit.log', 
        date('[Y-m-d H:i:s] ') . "Détails du quiz et de l'utilisateur : " . json_encode([
            'quiz_title' => $foundQuiz['title'],
            'user_institution_type' => $userInstitutionType,
            'user_institution_name' => $userInstitutionName
        ]) . "\n", 
        FILE_APPEND
    );

    // Vérifier si c'est un quiz d'entreprise
    $isCompanyQuiz = 
        ($userInstitutionType === 'entreprise') || 
        (isset($foundQuiz['type']) && $foundQuiz['type'] === 'company');

    // Préparer les données de réponse
    $userResponseData = [
        'user_email' => $userEmail,
        'quiz_id' => $quizId,
        'quiz_title' => $foundQuiz['title'] ?? 'Quiz sans titre',
        'responses' => $userResponses,
        'is_survey' => $isCompanyQuiz,
        'completed_at' => date('Y-m-d H:i:s')
    ];

    // Calcul du score uniquement pour les quiz non-entreprise
    if (!$isCompanyQuiz) {
        $score = 0;
        $totalPoints = 0;

        foreach ($foundQuiz['questions'] as $index => $question) {
            $points = isset($question['points']) ? intval($question['points']) : 1;
            $totalPoints += $points;
            
            // Vérification pour les QCM
            if (isset($question['correct_answer']) && 
                isset($userResponses[$index]) &&
                $userResponses[$index] === $question['correct_answer']) {
                $score += $points;
            }
            // Vérification pour les questions libres
            elseif (isset($userResponses[$index]) && 
                    !empty(trim($userResponses[$index]))) {
                $score += $points;
            }
        }

        $userResponseData['score'] = $score;
        $userResponseData['total_points'] = $totalPoints;
    } else {
        $userResponseData['score'] = null;
        $userResponseData['total_points'] = null;
    }

    // Log des données de réponse avant sauvegarde
    file_put_contents(__DIR__ . '/debug_submit.log', 
        date('[Y-m-d H:i:s] ') . "Données de réponse : " . json_encode($userResponseData) . "\n", 
        FILE_APPEND
    );

    // Ajouter la réponse au fichier
    file_put_contents(
        $userResponsesFile, 
        json_encode($userResponseData) . PHP_EOL, 
        FILE_APPEND
    );

    // Répondre avec le succès et des informations sur le type de quiz
    echo json_encode([
        'success' => true,
        'quiz_id' => $quizId,
        'is_survey' => $isCompanyQuiz
    ]);

} catch (Exception $e) {
    // Log de l'erreur
    file_put_contents(__DIR__ . '/debug_submit.log', 
        date('[Y-m-d H:i:s] ') . "Erreur : " . $e->getMessage() . "\n", 
        FILE_APPEND
    );
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la soumission du quiz : ' . $e->getMessage()
    ]);
}