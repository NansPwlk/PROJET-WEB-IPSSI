<?php
// verify.php
session_start();
require_once 'config.php';

class CaptchaVerifier {
    private $token;
    private $response;

    public function __construct($token, $response) {
        $this->token = $token;
        $this->response = $response;
    }

    public function verify() {
        // Vérifier si une session captcha existe
        if (!isset($_SESSION[CAPTCHA_SESSION_KEY])) {
            return $this->error('Session captcha inexistante');
        }

        $captcha = $_SESSION[CAPTCHA_SESSION_KEY];

        // Vérifier le token
        if ($captcha['token'] !== $this->token) {
            return $this->error('Token invalide');
        }

        // Vérifier l'expiration
        if (time() > $captcha['expires']) {
            unset($_SESSION[CAPTCHA_SESSION_KEY]);
            return $this->error('Le captcha a expiré');
        }

        // Vérifier le nombre de tentatives
        if ($captcha['attempts'] >= MAX_ATTEMPTS) {
            unset($_SESSION[CAPTCHA_SESSION_KEY]);
            return $this->error('Trop de tentatives');
        }

        // Incrémenter le compteur de tentatives
        $_SESSION[CAPTCHA_SESSION_KEY]['attempts']++;

        // Vérifier la réponse selon le type de défi
        $isValid = $this->validateResponse($captcha['solution']);

        if ($isValid) {
            unset($_SESSION[CAPTCHA_SESSION_KEY]);
            return ['success' => true, 'message' => 'Vérification réussie'];
        }

        return $this->error('Réponse incorrecte');
    }

    private function validateResponse($solution) {
        switch (gettype($solution)) {
            case 'array':
                // Pour les défis de type séquence ou sélection d'images
                return $this->compareArrays($solution, $this->response);
            
            case 'integer':
                // Pour les défis de type puzzle
                return $solution === (int)$this->response;
            
            default:
                return false;
        }
    }

    private function compareArrays($solution, $response) {
        if (!is_array($response)) return false;
        
        // Trier les tableaux pour une comparaison indépendante de l'ordre
        sort($solution);
        sort($response);
        
        return $solution === $response;
    }

    private function error($message) {
        return [
            'success' => false,
            'message' => $message
        ];
    }
}

// Point d'entrée de l'API
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    // Récupérer les données
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['token']) || !isset($data['response'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes']);
        exit;
    }

    try {
        $verifier = new CaptchaVerifier($data['token'], $data['response']);
        echo json_encode($verifier->verify());
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}