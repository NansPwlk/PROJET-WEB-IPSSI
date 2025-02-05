<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Génération du CAPTCHA
    $num1 = rand(1, 20); // On peut augmenter la plage pour plus de difficulté
    $num2 = rand(1, 20);
    $_SESSION['captcha_answer'] = $num1 + $num2;
    $_SESSION['captcha_time'] = time();

    echo json_encode([
        "success" => true,
        "question" => "Combien font $num1 + $num2 ?"
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userAnswer = isset($_POST['captcha_answer']) ? (int) $_POST['captcha_answer'] : 0;
    $correctAnswer = isset($_SESSION['captcha_answer']) ? $_SESSION['captcha_answer'] : null;
    $captchaTime = isset($_SESSION['captcha_time']) ? $_SESSION['captcha_time'] : 0;

    // Vérifier si le CAPTCHA n'a pas expiré (5 minutes)
    if (time() - $captchaTime > 300) {
        echo json_encode([
            "success" => false,
            "error" => "Le CAPTCHA a expiré"
        ]);
        exit;
    }

    if ($correctAnswer !== null && $userAnswer === $correctAnswer) {
        $_SESSION['captcha_validated'] = true;
        echo json_encode(["success" => true]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Réponse incorrecte"
        ]);
    }
    exit;
}

echo json_encode(["error" => "Méthode non autorisée"]);
?>