<?php

// Configuration générale
define('CAPTCHA_SESSION_KEY', 'quizzeo_captcha');
define('CAPTCHA_EXPIRY_TIME', 300); // 5 minutes en secondes

// Types de défis disponibles
define('CHALLENGE_TYPES', [
    'puzzle',      // Glisser-déposer de puzzle
    'image',       // Sélection d'images
    'sequence'     // Séquence de symboles
]);

// Configuration des images
define('IMAGE_CATEGORIES', [
    'voitures' => 'Sélectionnez toutes les voitures',
    'animaux' => 'Sélectionnez tous les chats',
    'fruits' => 'Sélectionnez tous les fruits rouges'
]);

// Configuration des symboles pour les séquences
define('SEQUENCE_SYMBOLS', ['★', '◆', '●', '▲', '■', '♦', '♥', '♠']);

// Configuration du puzzle
define('PUZZLE_DIFFICULTY_LEVELS', [
    'easy' => ['grid' => 2, 'pieces' => 1],
    'medium' => ['grid' => 3, 'pieces' => 2],
    'hard' => ['grid' => 4, 'pieces' => 3]
]);

// Messages d'erreur
define('ERROR_MESSAGES', [
    'expired' => 'Le captcha a expiré, veuillez réessayer',
    'invalid' => 'Vérification échouée, veuillez réessayer',
    'missing' => 'Données manquantes'
]);

// Configuration de la sécurité
define('MAX_ATTEMPTS', 3);
define('ATTEMPT_TIMEOUT', 60); // 1 minute en secondes

// Chemin vers les assets
define('ASSETS_PATH', __DIR__ . '/../assets');
define('IMAGES_PATH', ASSETS_PATH . '/images');
define('SYMBOLS_PATH', ASSETS_PATH . '/symbols');