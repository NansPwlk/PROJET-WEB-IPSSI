document.addEventListener('DOMContentLoaded', function() {
    // Charger les informations de l'école
    loadSchoolInfo();
    // Charger les quiz
    loadQuizzes();
});

async function loadSchoolInfo() {
    try {
        const response = await fetch('/php/auth/get_school_info.php');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('schoolName').textContent = 
                `${data.school.schoolName} (${data.school.schoolCity})`;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
    }
}

async function loadQuizzes() {
    try {
        const response = await fetch('/php/auth/get_school_quizzes.php');  // Ajouter /php/
        const data = await response.json();
        
        const quizList = document.getElementById('quizList');
        
        if (data.success && data.quizzes) {
            quizList.innerHTML = data.quizzes.map(quiz => createQuizCard(quiz)).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des quiz:', error);
    }
}

function createQuizCard(quiz) {
    const statusClasses = {
        'draft': 'status-draft',
        'active': 'status-active',
        'completed': 'status-completed'
    };

    const statusText = {
        'draft': 'En cours d\'écriture',
        'active': 'Lancé',
        'completed': 'Terminé'
    };

    return `
        <div class="quiz-card">
            <span class="quiz-status ${statusClasses[quiz.status]}">
                ${statusText[quiz.status]}
            </span>
            <h3 class="quiz-title">${quiz.title}</h3>
            <div class="quiz-stats">
                <span>${quiz.questions_count} questions</span>
                <span>${quiz.responses_count} réponses</span>
            </div>
            <div class="quiz-actions">
                ${quiz.status === 'draft' ? `
                    <button class="quiz-action-btn btn-edit" onclick="editQuiz('${quiz.id}')">
                        Modifier
                    </button>
                ` : ''}
                ${quiz.status === 'active' ? `
                    <button class="quiz-action-btn btn-view" onclick="viewQuiz('${quiz.id}')">
                        Voir
                    </button>
                ` : ''}
                ${quiz.status === 'completed' ? `
                    <button class="quiz-action-btn btn-results" onclick="viewResults('${quiz.id}')">
                        Résultats
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function viewQuiz(quizId) {
    window.location.href = `/public/view-quiz.html?id=${quizId}`;
}

function editQuiz(quizId) {
    window.location.href = `/public/edit-quiz.html?id=${quizId}`;
}

function createQuizCard(quiz) {
    return `
        <div class="quiz-card">
            <span class="quiz-status ${quiz.status === 'draft' ? 'status-draft' : quiz.status === 'active' ? 'status-active' : 'status-completed'}">
                ${quiz.status === 'draft' ? 'Brouillon' : quiz.status === 'active' ? 'En cours' : 'Terminé'}
            </span>
            <h3 class="quiz-title">${quiz.title}</h3>
            <div class="quiz-stats">
                <span>${quiz.questions_count} questions</span>
                <span>${quiz.responses_count} réponses</span>
            </div>
            <div class="quiz-actions">
                ${quiz.status === 'draft' ? 
                    `<button class="quiz-action-btn btn-edit" onclick="editQuiz('${quiz.id}')">Modifier</button>` : 
                    `<button class="quiz-action-btn btn-view" onclick="viewQuiz('${quiz.id}')">Voir</button>`}
            </div>
        </div>
    `;
}

async function createNewQuiz() {
    window.location.href = '/public/create-quiz.html';
}

async function editQuiz(quizId) {
    window.location.href = `/public/edit-quiz.html?id=${quizId}`;
}

async function viewQuiz(quizId) {
    window.location.href = `/public/view-quiz.html?id=${quizId}`;
}

async function viewResults(quizId) {
    window.location.href = `/public/quiz-results.html?id=${quizId}`;
}