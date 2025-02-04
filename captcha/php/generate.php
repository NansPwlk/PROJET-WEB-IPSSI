<?php
// generate.php
session_start();
require_once 'config.php';

class CaptchaGenerator {
    private $type;
    private $challenge;
    private $solution;

    public function __construct() {
        $this->type = CHALLENGE_TYPES[array_rand(CHALLENGE_TYPES)];
        $this->generateChallenge();
    }

    private function generateChallenge() {
        switch ($this->type) {
            case 'puzzle':
                $this->generatePuzzleChallenge();
                break;
            case 'image':
                $this->generateImageChallenge();
                break;
            case 'sequence':
                $this->generateSequenceChallenge();
                break;
        }
    }

    private function generatePuzzleChallenge() {
        $difficulty = array_rand(PUZZLE_DIFFICULTY_LEVELS);
        $config = PUZZLE_DIFFICULTY_LEVELS[$difficulty];
        
        // Générer une position cible aléatoire pour le puzzle
        $this->challenge = [
            'type' => 'puzzle',
            'difficulty' => $difficulty,
            'grid' => $config['grid'],
            'targetPosition' => rand(0, $config['grid'] - 1)
        ];
        
        $this->solution = $this->challenge['targetPosition'];
    }

    private function generateImageChallenge() {
        $category = array_rand(IMAGE_CATEGORIES);
        $instruction = IMAGE_CATEGORIES[$category];
        
        // Charger et mélanger les images de la catégorie
        $images = $this->loadImagesFromCategory($category);
        shuffle($images);
        
        $this->challenge = [
            'type' => 'image',
            'instruction' => $instruction,
            'images' => array_slice($images, 0, 9) // Prendre 9 images
        ];
        
        // Marquer les bonnes réponses
        $this->solution = array_keys(array_filter($this->challenge['images'], 
            function($img) use ($category) {
                return $img['category'] === $category;
            }
        ));
    }

    private function generateSequenceChallenge() {
        $length = rand(3, 5);
        $sequence = [];
        
        for ($i = 0; $i < $length; $i++) {
            $sequence[] = SEQUENCE_SYMBOLS[array_rand(SEQUENCE_SYMBOLS)];
        }
        
        $this->challenge = [
            'type' => 'sequence',
            'sequence' => $sequence,
            'available_symbols' => SEQUENCE_SYMBOLS
        ];
        
        $this->solution = $sequence;
    }

    private function loadImagesFromCategory($category) {
        $images = [];
        $path = IMAGES_PATH . '/' . $category;
        
        if (is_dir($path)) {
            $files = scandir($path);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    $images[] = [
                        'src' => "assets/images/$category/$file",
                        'category' => $category
                    ];
                }
            }
        }
        
        return $images;
    }

    public function getChallenge() {
        // Générer un token unique pour ce défi
        $token = bin2hex(random_bytes(32));
        
        // Sauvegarder le défi en session
        $_SESSION[CAPTCHA_SESSION_KEY] = [
            'token' => $token,
            'solution' => $this->solution,
            'expires' => time() + CAPTCHA_EXPIRY_TIME,
            'attempts' => 0
        ];

        return [
            'token' => $token,
            'challenge' => $this->challenge
        ];
    }
}

// Point d'entrée de l'API
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    
    try {
        $generator = new CaptchaGenerator();
        echo json_encode($generator->getChallenge());
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}