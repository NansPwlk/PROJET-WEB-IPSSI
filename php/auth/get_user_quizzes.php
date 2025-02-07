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
$usersFile = __DIR__ . '/../../data/users.txt';

try {
    // Récupérer les informations de l'utilisateur
    $userInfo = $_SESSION['user'];
    $userEmail = $userInfo['email'];

    // Charger les informations de l'utilisateur depuis le fichier users.txt
    $users = file($usersFile, FILE_IGNORE_NEW_LINES);
    $userFound = false;
    $institutionInfo = null;

    foreach ($users as $userLine) {
        $userData = json_decode($userLine, true);
        if ($userData['email'] === $userEmail) {
            // Vérifier la présence de l'institution
            if (isset($userData['affiliated_institution'])) {
                $institutionInfo = $userData['affiliated_institution'];
                $userFound = true;
                break;
            }
        }
    }

    if (!$userFound || !$institutionInfo) {
        error_log('Détails utilisateur : ' . print_r($userInfo, true));
        throw new Exception('Informations d\'institution introuvables pour l\'utilisateur');
    }

    $institutionType = $institutionInfo['type'];
    $institutionName = $institutionInfo['name'];
    $companyActivityDomain = $institutionInfo['activityDomain'] ?? null;
    
    error_log('Informations d\'institution récupérées : ' . print_r($institutionInfo, true));

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
                    // Quiz de l'entreprise
                    (isset($quizData['company_name']) && $quizData['company_name'] === $institutionName) ||
                    // Quiz génériques d'entreprise
                    (isset($quizData['type']) && $quizData['type'] === 'company') ||
                    // Quiz lié au domaine d'activité
                    (isset($quizData['activityDomain']) && $quizData['activityDomain'] === $companyActivityDomain);
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