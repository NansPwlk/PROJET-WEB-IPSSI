document.addEventListener('DOMContentLoaded', function() {
    // Charger les informations de l'entreprise
    loadCompanyInfo();
    // Charger les quiz
    loadQuizzes();
});

async function loadCompanyInfo() {
    try {
        const response = await fetch('/php/auth/get_company_info.php');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('companyName').textContent = data.company.companyName;
            document.getElementById('activityDomain').textContent = data.company.activityDomain;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des informations:', error);
    }
}

async function loadQuizzes() {
    try {
        const response = await fetch('/php/auth/get_company_quizzes.php');
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
    return `
        <div class="quiz-card">
            <span class="quiz-status ${getStatusClass(quiz.status)}">
                ${getStatusText(quiz.status)}
            </span>
            <h3 class="quiz-title">${quiz.title}</h3>
            <div class="quiz-stats">
                <span>${quiz.questions_count} questions</span>
                <span>${quiz.responses_count} réponses</span>
            </div>
            <div class="quiz-actions">
                ${quiz.status === 'draft' ? `
                    <button class="quiz-action-btn btn-edit" onclick="editQuiz('${quiz.id}')">Modifier</button>
                    <button class="quiz-action-btn btn-publish" onclick="publishQuiz('${quiz.id}')">Publier</button>
                ` : quiz.status === 'active' ? `
                    <button class="quiz-action-btn btn-view" onclick="viewQuiz('${quiz.id}')">Voir</button>
                    <button class="quiz-action-btn btn-results" onclick="viewResponses('${quiz.id}')">Réponses</button>
                ` : `
                    <button class="quiz-action-btn btn-results" onclick="viewResponses('${quiz.id}')">Résultats</button>
                `}
            </div>
        </div>
    `;
}

function getStatusClass(status) {
    switch(status) {
        case 'draft': return 'status-draft';
        case 'active': return 'status-active';
        case 'completed': return 'status-completed';
        default: return '';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'draft': return 'Brouillon';
        case 'active': return 'En cours';
        case 'completed': return 'Terminé';
        default: return status;
    }
}

function createNewQuiz() {
    window.location.href = '/public/create-company-quiz.html';
}

async function editQuiz(quizId) {
    window.location.href = `/public/edit-company-quiz.html?id=${quizId}`;
}

async function viewQuiz(quizId) {
    window.location.href = `/public/view-company-quiz.html?id=${quizId}`;
}

async function viewResponses(quizId) {
    window.location.href = `/public/company-quiz-responses.html?id=${quizId}`;
}

async function publishQuiz(quizId) {
    try {
        const response = await fetch('/php/quiz/publish_company_quiz.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quiz_id: quizId })
        });

        const data = await response.json();
        
        if (data.success) {
            loadQuizzes(); // Recharger la liste des quiz
        } else {
            alert('Erreur lors de la publication du quiz');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la publication du quiz');
    }
}