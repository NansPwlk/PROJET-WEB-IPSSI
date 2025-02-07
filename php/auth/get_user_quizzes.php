<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Accès non autorisé']);
    exit;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';
$userResponsesFile = __DIR__ . '/../../data/user_responses.txt';

try {
    // Récupérer les informations de l'utilisateur avec des vérifications supplémentaires
    $userInfo = $_SESSION['user'];
    
    // Vérification et extraction des informations d'institution
    $institutionInfo = $userInfo['affiliated_institution'] ?? null;
    
    if (!$institutionInfo) {
        // Vérifier l'existence de l'institution dans les données utilisateur
        error_log('Tentative de récupération de l\'institution depuis les données utilisateur');
        
        // Si institution manquante dans la session, essayer de la trouver dans le fichier users.txt
        $usersFile = __DIR__ . '/../../data/users.txt';
        $users = file($usersFile, FILE_IGNORE_NEW_LINES);
        
        foreach ($users as $userLine) {
            $userData = json_decode($userLine, true);
            if ($userData['email'] === $userInfo['email']) {
                $institutionInfo = $userData['affiliated_institution'] ?? null;
                break;
            }
        }
        
        if (!$institutionInfo) {
            throw new Exception('Informations d\'institution introuvables');
        }
    }

    $userEmail = $userInfo['email'];
    $institutionType = $institutionInfo['type'];
    $institutionName = $institutionInfo['name'];
    
    error_log('Informations d\'institution : ' . print_r($institutionInfo, true));

    $availableQuizzes = [];
    $completedQuizzes = [];

    // Charger les réponses de l'utilisateur
    $userCompletedQuizzes = [];
    if (file_exists($userResponsesFile)) {
        $responses = file($userResponsesFile, FILE_IGNORE_NEW_LINES);
        foreach ($responses as $response) {
            $responseData = json_decode($response, true);
            if ($responseData['user_email'] === $userEmail) {
                $userCompletedQuizzes[$responseData['quiz_id']] = $responseData;
            }
        }
    }

    // Charger les quiz
    if (file_exists($quizzesFile)) {
        $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
        foreach ($quizzes as $quiz) {
            $quizData = json_decode($quiz, true);
            
            // Vérification de l'institution
            $matchInstitution = false;
            
            if ($institutionType === 'ecole') {
                $matchInstitution = 
                    (isset($quizData['school_name']) && $quizData['school_name'] === $institutionName) ||
                    (isset($quizData['creator_email']) && strpos($quizData['creator_email'], '@ecole.net') !== false);
            } elseif ($institutionType === 'entreprise') {
                $matchInstitution = 
                    (isset($quizData['company_name']) && $quizData['company_name'] === $institutionName) ||
                    (isset($quizData['creator_email']) && strpos($quizData['creator_email'], '@entreprise.net') !== false);
            }

            // Vérification du statut du quiz
            $isActiveQuiz = isset($quizData['status']) && $quizData['status'] === 'active';

            // Ajout des quiz
            if ($matchInstitution && $isActiveQuiz) {
                if (isset($userCompletedQuizzes[$quizData['id']])) {
                    // Quiz déjà complété
                    $completedQuizzes[] = $quizData;
                } else {
                    // Quiz disponible
                    $availableQuizzes[] = $quizData;
                }
            }
        }
    }

    error_log('Quiz disponibles : ' . count($availableQuizzes));
    error_log('Quiz complétés : ' . count($completedQuizzes));

    echo json_encode([
        'success' => true,
        'available_quizzes' => $availableQuizzes,
        'completed_quizzes' => $completedQuizzes
    ]);

} catch (Exception $e) {
    error_log('Erreur détaillée : ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la récupération des quiz',
        'message' => $e->getMessage()
    ]);
}