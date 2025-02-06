<?php
session_start();
header('Content-Type: application/json');

// Vérifie si l'utilisateur est connecté et a le rôle "entreprise"
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'entreprise') {
    echo json_encode(['success' => false, 'error' => 'Accès refusé']);
    exit();
}

require_once 'db_connection.php';  // Assure-toi de configurer la connexion à la base de données

try {
    // Récupère l'ID de l'entreprise associée à l'utilisateur
    $enterpriseId = $_SESSION['enterprise_id'];

    // Prépare la requête pour récupérer les sondages liés à l'entreprise
    $stmt = $pdo->prepare("SELECT id, title, description, status, questions_count, responses_count 
                           FROM surveys 
                           WHERE enterprise_id = :enterprise_id");

    $stmt->execute(['enterprise_id' => $enterpriseId]);
    $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Renvoie les données sous forme de JSON
    echo json_encode([
        'success' => true,
        'surveys' => $surveys
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
