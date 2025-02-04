<?php
// index.php
session_start();

// Définir les headers CORS si nécessaire
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Routage des requêtes
$route = $_SERVER['REQUEST_URI'];
$base = '/captcha'; // Ajuster selon votre configuration

switch (true) {
    case preg_match("#^$base/generate$#", $route):
        require_once 'php/generate.php';
        break;
        
    case preg_match("#^$base/verify$#", $route):
        require_once 'php/verify.php';
        break;
        
    case preg_match("#^$base/assets/(.+)$#", $route, $matches):
        // Servir les assets de manière sécurisée
        $file = 'assets/' . $matches[1];
        if (file_exists($file)) {
            $mime = mime_content_type($file);
            header("Content-Type: $mime");
            readfile($file);
        } else {
            http_response_code(404);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
}