document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadQuizzes();
});

async function loadUserInfo() {
    try {
        const response = await fetch('/php/auth/get_user_info.php');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('userName').textContent = 
                `${data.user.firstname} ${data.user.lastname}`;
            document.getElementById('institutionName').textContent = 
                (data.user.affiliated_institution && data.user.affiliated_institution.name) 
                ? data.user.affiliated_institution.name 
                : 'Institution non définie';
        } else {
            console.error('Erreur lors du chargement des informations utilisateur');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
        window.location.href = '/login.html';
    }
}

async function loadQuizzes() {
    try {
        // Charger les quiz disponibles
        const availableQuizzesResponse = await fetch('/php/auth/get_user_quizzes.php');
        const availableQuizzesText = await availableQuizzesResponse.text();
        
        console.log('Réponse brute des quiz disponibles:', availableQuizzesText);
        
        let availableQuizzesData;
        try {
            availableQuizzesData = JSON.parse(availableQuizzesText);
        } catch (parseError) {
            console.error('Erreur de parsing JSON pour les quiz disponibles:', parseError);
            throw new Error('Impossible de parser les quiz disponibles');
        }

        // Charger les résultats des quiz
        const quizResultsResponse = await fetch('/php/auth/get_quiz_results.php');
        const quizResultsText = await quizResultsResponse.text();
        
        console.log('Réponse brute des résultats de quiz:', quizResultsText);
        
        let quizResultsData;
        try {
            quizResultsData = JSON.parse(quizResultsText);
        } catch (parseError) {
            console.error('Erreur de parsing JSON pour les résultats de quiz:', parseError);
            throw new Error('Impossible de parser les résultats de quiz');
        }

        if (availableQuizzesData.success) {
            displayAvailableQuizzes(availableQuizzesData.available_quizzes || []);
        }

        if (quizResultsData.success) {
            displayCompletedQuizzes(quizResultsData.quiz_results || []);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des quiz:', error);
        
        // Afficher un message d'erreur à l'utilisateur
        const availableQuizzesContainer = document.getElementById('availableQuizzes');
        const completedQuizzesContainer = document.getElementById('completedQuizzes');
        
        availableQuizzesContainer.innerHTML = '<p class="no-quiz">Impossible de charger les quiz disponibles</p>';
        completedQuizzesContainer.innerHTML = '<p class="no-quiz">Impossible de charger les quiz complétés</p>';
    }
}

function displayAvailableQuizzes(quizzes) {
    const container = document.getElementById('availableQuizzes');
    
    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = '<p class="no-quiz">Aucun quiz disponible pour le moment</p>';
        return;
    }

    container.innerHTML = quizzes.map(quiz => `
        <div class="quiz-card">
            <h3 class="quiz-title">${quiz.title || 'Quiz sans titre'}</h3>
            <p class="quiz-info">Créé par: ${quiz.creator_name || 'Créateur inconnu'}</p>
            <p class="quiz-stats">${(quiz.questions || []).length} questions</p>
            <button class="start-quiz-btn" onclick="startQuiz('${quiz.id}')">
                Commencer le quiz
            </button>
        </div>
    `).join('');
}

function displayCompletedQuizzes(quizzes) {
    const container = document.getElementById('completedQuizzes');
    
    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = '<p class="no-quiz">Vous n\'avez pas encore complété de quiz</p>';
        return;
    }

    container.innerHTML = quizzes.map(quiz => `
        <div class="quiz-card completed">
            <h3 class="quiz-title">${quiz.quiz_title || 'Quiz sans titre'}</h3>
            <p class="quiz-info">Complété le: ${quiz.completed_at || 'Date inconnue'}</p>
            <div class="quiz-result">
                <span class="score">Score: ${quiz.score || 0}/${quiz.total_points || 0}</span>
                <span class="percentage">${quiz.total_points ? Math.round(quiz.score/quiz.total_points * 100) : 0}%</span>
            </div>
            <button class="view-result-btn" onclick="viewQuizResult('${quiz.quiz_id}')">
                Voir les détails
            </button>
        </div>
    `).join('');
}

function startQuiz(quizId) {
    window.location.href = `/public/take-quiz.html?quiz_id=${quizId}`;
}

function viewQuizResult(quizId) {
    window.location.href = `/public/quiz-result.html?quiz_id=${quizId}`;
}