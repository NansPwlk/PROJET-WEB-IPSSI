<?php
session_start();
header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté et est une entreprise
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'entreprise') {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données du formulaire
$title = $_POST['title'] ?? '';
$questions = json_decode($_POST['questions'], true);
$status = $_POST['status'] ?? 'active';

if (empty($title) || empty($questions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

// Préparer les données du quiz
$quizData = [
    'id' => uniqid(),
    'title' => $title,
    'creator_email' => $_SESSION['user']['email'],
    'creator_name' => $_SESSION['user']['firstname'] . ' ' . $_SESSION['user']['lastname'],
    'company_name' => $_SESSION['user']['companyName'] ?? '',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => $status,
    'type' => 'company', // Pour identifier que c'est un quiz entreprise
    'questions' => [],
    'responses' => []
];

// Traiter chaque question
foreach ($questions as $question) {
    $questionData = [
        'question' => $question['question'],
        'points' => (int)$question['points'],
        'type' => $question['type']
    ];

    if ($question['type'] === 'qcm') {
        $questionData['options'] = $question['options'];
        $questionData['correct_answer'] = (int)$question['correct_answer'];
    } else {
        $questionData['description'] = $question['description'] ?? '';
    }

    $quizData['questions'][] = $questionData;
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

try {
    // Créer le fichier s'il n'existe pas
    if (!file_exists($quizzesFile)) {
        touch($quizzesFile);
    }
    
    // Debug
    error_log('Quiz à sauvegarder : ' . print_r($quizData, true));
    
    // Ajouter le nouveau quiz
    $quizJson = json_encode($quizData) . "\n";
    file_put_contents($quizzesFile, $quizJson, FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => 'Quiz créé avec succès',
        'quizId' => $quizData['id']
    ]);
} catch (Exception $e) {
    error_log('Erreur lors de la sauvegarde du quiz : ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde du quiz']);
}