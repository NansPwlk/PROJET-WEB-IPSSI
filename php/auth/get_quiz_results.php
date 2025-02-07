<?php
session_start();
header('Content-Type: application/json');

// Vérifier l'authentification
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'utilisateur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Accès non autorisé']);
    exit;
}

$userEmail = $_SESSION['user']['email'];
$userResponsesFile = __DIR__ . '/../../data/user_responses.txt';

try {
    // Vérifier si le fichier de réponses existe
    if (!file_exists($userResponsesFile)) {
        echo json_encode([
            'success' => true,
            'quiz_results' => []
        ]);
        exit;
    }

    // Lire les réponses des utilisateurs
    $userResponses = file($userResponsesFile, FILE_IGNORE_NEW_LINES);
    
    // Filtrer et formater les réponses de l'utilisateur
    $userQuizResponses = [];
    foreach ($userResponses as $responseLine) {
        $responseData = json_decode($responseLine, true);
        
        // Vérifier si la réponse correspond à l'utilisateur
        if ($responseData['user_email'] === $userEmail) {
            // Formater la date avec le format local
            $completedAt = DateTime::createFromFormat('Y-m-d H:i:s', $responseData['completed_at']);
            $formattedDate = $completedAt ? $completedAt->format('d/m/Y') : 'Date inconnue';
            
            $userQuizResponses[] = [
                'quiz_title' => $responseData['quiz_title'] ?? 'Quiz sans titre',
                'completed_at' => $formattedDate,
                'score' => $responseData['score'] ?? 0,
                'total_points' => $responseData['total_points'] ?? 0
            ];
        }
    }

    // Trier les quiz par date de complétion (du plus récent au plus ancien)
    usort($userQuizResponses, function($a, $b) {
        return strtotime(str_replace('/', '-', $b['completed_at'])) - 
                strtotime(str_replace('/', '-', $a['completed_at']));
    });

    // Répondre avec les résultats
    echo json_encode([
        'success' => true,
        'quiz_results' => $userQuizResponses
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur lors de la récupération des résultats : ' . $e->getMessage()
    ]);
}