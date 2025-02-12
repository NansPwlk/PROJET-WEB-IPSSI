<?php
session_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Vérifier l'authentification
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Accès non autorisé']);
    exit;
}

// Vérifier si l'ID du quiz est présent
if (!isset($_GET['quiz_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID du quiz manquant']);
    exit;
}

$quizId = $_GET['quiz_id'];
$quizzesFile = __DIR__ . '/../../data/quizzes.txt';
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

    // Lire tous les quiz
    $quizzes = file($quizzesFile, FILE_IGNORE_NEW_LINES);
    
    // Chercher le quiz correspondant
    $foundQuiz = null;
    foreach ($quizzes as $quizLine) {
        $quizData = json_decode($quizLine, true);
        
        // Log de chaque quiz pour débogage
        error_log('Quiz examiné : ' . print_r($quizData, true));
        
        if ($quizData['id'] === $quizId) {
            // Vérifier si le quiz correspond à l'institution de l'utilisateur
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
            
            // Vérifier le statut du quiz
            $isActiveQuiz = $quizData['status'] === 'active';
            
            // Log des résultats de vérification
            error_log('Correspondance institution : ' . ($matchInstitution ? 'Oui' : 'Non'));
            error_log('Quiz actif : ' . ($isActiveQuiz ? 'Oui' : 'Non'));
            
            if ($matchInstitution && $isActiveQuiz) {
                $foundQuiz = $quizData;
                break;
            }
        }
    }
    
    if ($foundQuiz) {
        // Retirer les réponses correctes avant d'envoyer au client
        unset($foundQuiz['correct_answers']);
        
        echo json_encode([
            'success' => true,
            'quiz' => $foundQuiz
        ]);
    } else {
        // Log détaillé en cas d'échec
        error_log('Quiz non trouvé ou non accessible : ' . $quizId);
        
        http_response_code(404);
        echo json_encode([
            'success' => false, 
            'error' => 'Quiz non trouvé ou non accessible'
        ]);
    }
    
} catch (Exception $e) {
    // Log de l'erreur complète
    error_log('Erreur complète : ' . $e->getMessage());
    error_log('Trace : ' . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la récupération du quiz : ' . $e->getMessage()
    ]);
}