document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du quiz depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz_id');

    console.log('ID du quiz récupéré :', quizId);

    if (!quizId) {
        showErrorMessage('Aucun quiz sélectionné');
        return;
    }

    // Charger les résultats du quiz
    fetchQuizResults(quizId);

    // Ajouter un écouteur d'événement pour le bouton de retour au dashboard
    document.getElementById('returnToDashboardBtn').addEventListener('click', function() {
        window.location.href = '/public/user-dashboard.html';
    });
});

async function fetchQuizResults(quizId) {
    try {
        console.log('Tentative de récupération des résultats pour le quiz :', quizId);
        
        const response = await fetch(`/php/auth/get_quiz_results.php?quiz_id=${quizId}`);
        const text = await response.text();
        
        console.log('Réponse brute des résultats:', text);
        
        let data;
        try {
            data = JSON.parse(text);
            console.log('Données JSON parsées :', data);
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            showErrorMessage('Erreur de chargement des résultats');
            return;
        }

        if (data.success) {
            console.log('Résultats reçus :', data.quiz_result);
            displayQuizResults(data.quiz_result);
        } else {
            console.error('Erreur de chargement des résultats :', data.error);
            throw new Error(data.error || 'Impossible de charger les résultats');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error);
        showErrorMessage(error.message || 'Erreur lors du chargement des résultats');
    }
}

function showErrorMessage(message) {
    document.querySelector('.quiz-result-content').innerHTML = `
        <h1>Erreur</h1>
        <p>${message}</p>
        <button id="returnToDashboardBtn" class="submit-btn">
            Retour au Dashboard
        </button>
    `;
}

function displayQuizResults(resultData) {
    console.log('Données de résultat reçues :', resultData);

    const quizTitleEl = document.getElementById('quizTitle');
    const userScoreEl = document.getElementById('userScore');
    const totalScoreEl = document.getElementById('totalScore');
    const scorePercentageEl = document.getElementById('scorePercentage');
    const resultFeedbackEl = document.getElementById('resultFeedback');

    // Vérifier que les données sont valides
    if (!resultData || 
        typeof resultData.score !== 'number' || 
        typeof resultData.total_points !== 'number') {
        console.error('Données de résultat invalides :', resultData);
        showErrorMessage('Données de résultat invalides');
        return;
    }

    // Mettre à jour le titre du quiz
    quizTitleEl.textContent = `Résultats - ${resultData.quiz_title || 'Quiz'}`;

    // Afficher le score
    userScoreEl.textContent = resultData.score;
    totalScoreEl.textContent = resultData.total_points;

    // Calculer et afficher le pourcentage
    const percentage = Math.round((resultData.score / resultData.total_points) * 100);
    scorePercentageEl.textContent = `${percentage}%`;

    // Ajouter du feedback en fonction du score
    let feedbackMessage = '';
    if (percentage === 100) {
        feedbackMessage = 'Félicitations ! Score parfait !';
        resultFeedbackEl.style.color = 'var(--color-success)';
    } else if (percentage >= 75) {
        feedbackMessage = 'Très bon résultat !';
        resultFeedbackEl.style.color = 'var(--color-success)';
    } else if (percentage >= 50) {
        feedbackMessage = 'Pas mal, continuez à vous améliorer.';
        resultFeedbackEl.style.color = 'var(--color-orange)';
    } else {
        feedbackMessage = 'Vous pouvez faire mieux. Relisez vos cours.';
        resultFeedbackEl.style.color = 'var(--color-error)';
    }

    resultFeedbackEl.textContent = feedbackMessage;
}