// Variables globales pour gérer le quiz
let currentQuizData = null;
let currentQuestionIndex = 0;
let userResponses = [];

// Charger les détails du quiz au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du quiz depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz_id');

    if (!quizId) {
        showErrorMessage('Aucun quiz sélectionné');
        return;
    }

    // Charger les détails du quiz
    fetchQuizDetails(quizId);
});

async function fetchQuizDetails(quizId) {
    try {
        const response = await fetch(`/php/auth/get_quiz_details.php?quiz_id=${quizId}`);
        const text = await response.text();
        
        console.log('Réponse brute du quiz:', text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            showErrorMessage('Erreur de chargement du quiz');
            return;
        }

        if (data.success) {
            currentQuizData = data.quiz;
            initializeQuiz();
        } else {
            throw new Error(data.error || 'Impossible de charger le quiz');
        }
    } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        showErrorMessage(error.message || 'Erreur lors du chargement du quiz');
    }
}

function showErrorMessage(message) {
    // Cacher le contenu du quiz
    document.querySelector('.quiz-container').innerHTML = `
        <div class="error-message-container">
            <h2>Erreur</h2>
            <p>${message}</p>
            <button onclick="window.location.href='/public/user-dashboard.html'" class="submit-btn">
                Retour au dashboard
            </button>
        </div>
    `;
}

function initializeQuiz() {
    // Vérifier si le quiz contient des questions
    if (!currentQuizData.questions || currentQuizData.questions.length === 0) {
        showErrorMessage('Ce quiz ne contient pas de questions');
        return;
    }

    // Mettre à jour le titre du quiz
    document.getElementById('quizTitle').textContent = currentQuizData.title;
    
    // Mettre à jour le nombre total de questions
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    totalQuestionsSpan.textContent = currentQuizData.questions.length;

    // Initialiser les réponses de l'utilisateur
    userResponses = new Array(currentQuizData.questions.length).fill(null);

    // Afficher la première question
    displayCurrentQuestion();
}

function displayCurrentQuestion() {
    const quizContent = document.getElementById('quizContent');
    const currentQuestion = currentQuizData.questions[currentQuestionIndex];
    
    // Vérifier si la question existe
    if (!currentQuestion) {
        showErrorMessage('Question invalide');
        return;
    }
    
    // Mettre à jour l'indicateur de question courante
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;

    // Gérer la visibilité des boutons de navigation
    document.getElementById('prevQuestionBtn').style.display = 
        currentQuestionIndex > 0 ? 'inline-block' : 'none';
    
    document.getElementById('nextQuestionBtn').style.display = 
        currentQuestionIndex < currentQuizData.questions.length - 1 ? 'inline-block' : 'none';
    
    document.getElementById('submitQuizBtn').style.display = 
        currentQuestionIndex === currentQuizData.questions.length - 1 ? 'inline-block' : 'none';

    // Créer le HTML pour la question
    let questionHTML = `
        <div class="question-container">
            <h2>${currentQuestion.question}</h2>
            <div class="options-container">
    `;

    // Ajouter les options de réponse
    currentQuestion.options.forEach((option, index) => {
        questionHTML += `
            <label class="option-label">
                <input 
                    type="radio" 
                    name="question-option" 
                    value="${index}" 
                    ${userResponses[currentQuestionIndex] === index ? 'checked' : ''}
                    onchange="recordResponse(${index})"
                >
                ${option}
            </label>
        `;
    });

    questionHTML += `</div></div>`;
    
    quizContent.innerHTML = questionHTML;
}

function recordResponse(optionIndex) {
    userResponses[currentQuestionIndex] = optionIndex;
}

function navigateQuestion(direction) {
    currentQuestionIndex += direction;
    
    // S'assurer de rester dans les limites
    currentQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, currentQuizData.questions.length - 1));
    
    displayCurrentQuestion();
}

async function submitQuiz() {
    // Vérifier que toutes les questions ont été répondues
    const unansweredQuestions = userResponses.filter(response => response === null);
    
    if (unansweredQuestions.length > 0) {
        alert('Veuillez répondre à toutes les questions avant de soumettre');
        return;
    }

    try {
        const response = await fetch('/php/auth/submit_quiz.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quiz_id: currentQuizData.id,
                responses: userResponses
            })
        });

        const text = await response.text();
        console.log('Réponse brute de soumission:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            showErrorMessage('Erreur lors de la soumission du quiz');
            return;
        }

        if (data.success) {
            // Rediriger vers la page de résultats avec l'ID du quiz
            window.location.href = `/public/quiz-result.html?quiz_id=${data.quiz_id}`;
        } else {
            throw new Error(data.error || 'Erreur lors de la soumission du quiz');
        }
    } catch (error) {
        console.error('Erreur lors de la soumission du quiz:', error);
        showErrorMessage(error.message || 'Erreur lors de la soumission du quiz');
    }
}