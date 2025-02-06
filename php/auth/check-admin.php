<?php
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user'])) {
    header('Location: /index.html');
    exit;
}

// Vérifier si l'utilisateur est admin
if ($_SESSION['user']['role'] !== 'admin') {
    header('Location: /access-denied.html');
    exit;
}