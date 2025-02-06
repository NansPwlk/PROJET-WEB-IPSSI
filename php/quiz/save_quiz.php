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

// Debug
error_log('POST Data: ' . print_r($_POST, true));

$title = $_POST['title'] ?? '';
$questions = $_POST['questions'] ?? [];
$points = $_POST['points'] ?? [];
$status = $_POST['status'] ?? 'active';

if (empty($title) || empty($questions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$quizData = [
    'id' => uniqid(),
    'title' => $title,
    'creator_email' => $_SESSION['user']['email'],
    'creator_name' => $_SESSION['user']['firstname'] . ' ' . $_SESSION['user']['lastname'],
    'school_name' => $_SESSION['user']['schoolName'] ?? '',
    'created_at' => date('Y-m-d H:i:s'),
    'status' => $status,
    'questions' => []
];

// Collecter toutes les données du formulaire
$formData = [];
foreach ($_POST as $key => $value) {
    if (strpos($key, 'options_') === 0) {
        $timestamp = str_replace('options_', '', $key);
        $formData[$timestamp]['options'] = $value;
    } elseif (strpos($key, 'correct_answer_') === 0) {
        $timestamp = str_replace('correct_answer_', '', $key);
        $formData[$timestamp]['correct_answer'] = $value;
    }
}

// Traiter chaque question
foreach ($questions as $index => $questionText) {
    $timestamp = array_keys($formData)[$index] ?? null;
    if ($timestamp && isset($formData[$timestamp])) {
        $quizData['questions'][] = [
            'question' => $questionText,
            'points' => $points[$index] ?? 1,
            'options' => $formData[$timestamp]['options'],
            'correct_answer' => (int)$formData[$timestamp]['correct_answer']
        ];
    }
}

$quizzesFile = __DIR__ . '/../../data/quizzes.txt';

try {
   // Créer le fichier s'il n'existe pas
    if (!file_exists($quizzesFile)) {
        touch($quizzesFile);
    }
    
   // Debug
    error_log('Quiz Data à sauvegarder: ' . print_r($quizData, true));
    
   // Ajouter le nouveau quiz
    $quizJson = json_encode($quizData) . "\n";
    file_put_contents($quizzesFile, $quizJson, FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => 'Quiz créé avec succès',
        'quizId' => $quizData['id']
    ]);
} catch (Exception $e) {
    error_log('Erreur lors de la sauvegarde: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde du quiz']);
}