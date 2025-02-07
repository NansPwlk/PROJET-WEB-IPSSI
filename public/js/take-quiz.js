// Variables globales pour gérer le quiz
let currentQuizData = null;
let currentQuestionIndex = 0;
let userResponses = [];
let isSurvey = false;

// Charger les détails du quiz au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du quiz depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quiz_id');

    console.log('ID du quiz récupéré :', quizId);

    if (!quizId) {
        showErrorMessage('Aucun quiz sélectionné');
        return;
    }

    // Charger les détails du quiz
    fetchQuizDetails(quizId);
});

async function fetchQuizDetails(quizId) {
    try {
        console.log('Tentative de récupération des détails du quiz :', quizId);
        
        const response = await fetch(`/php/auth/get_quiz_details.php?quiz_id=${quizId}`);
        const text = await response.text();
        
        console.log('Réponse brute des détails du quiz:', text);
        
        let data;
        try {
            data = JSON.parse(text);
            console.log('Données JSON parsées :', data);
        } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
            console.error('Réponse reçue :', text);
            showErrorMessage('Erreur de chargement des détails du quiz');
            return;
        }

        if (data.success) {
            console.log('Détails du quiz reçus :', data.quiz);
            currentQuizData = data.quiz;
            
            // Détecter si c'est un quiz potentiellement de type sondage
            isSurvey = currentQuizData.type === 'company';
            
            initializeQuiz();
        } else {
            console.error('Erreur de chargement des détails :', data.error);
            throw new Error(data.error || 'Impossible de charger les détails du quiz');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails du quiz:', error);
        showErrorMessage(error.message || 'Erreur lors du chargement des détails du quiz');
    }
}

function showErrorMessage(message) {
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

    // Déterminer le type de question
    const questionType = currentQuestion.type || (currentQuestion.options ? 'qcm' : 'free');
    console.log('Type de question détecté:', questionType);

    if (questionType === 'qcm' || currentQuestion.options) {
        // Questions à choix multiples
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
    } else {
        // Questions à réponse libre
        questionHTML += `
            <textarea 
                class="free-text-answer" 
                rows="4" 
                placeholder="Saisissez votre réponse ici"
                onchange="recordResponse(this.value)"
            >${userResponses[currentQuestionIndex] || ''}</textarea>
        `;
    }

    questionHTML += `</div></div>`;
    
    quizContent.innerHTML = questionHTML;
}

function recordResponse(response) {
    userResponses[currentQuestionIndex] = response;
}

function navigateQuestion(direction) {
    currentQuestionIndex += direction;
    
    // S'assurer de rester dans les limites
    currentQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, currentQuizData.questions.length - 1));
    
    displayCurrentQuestion();
}

async function submitQuiz() {
    // Vérifier que toutes les questions ont été répondues
    const unansweredQuestions = userResponses.filter(response => 
        response === null || (typeof response === 'string' && response.trim() === '')
    );
    
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
            console.error('Réponse reçue :', text);
            showErrorMessage('Erreur lors de la soumission du quiz');
            return;
        }

        if (data.success) {
            // Pour les sondages, rediriger simplement vers le dashboard
            if (data.is_survey) {
                alert('Votre sondage a bien été soumis.');
                window.location.href = '/public/user-dashboard.html';
            } else {
                // Pour les quiz normaux, aller à la page de résultats
                window.location.href = `/public/quiz-result.html?quiz_id=${currentQuizData.id}`;
            }
        } else {
            throw new Error(data.error || 'Erreur lors de la soumission');
        }
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        showErrorMessage(error.message || 'Erreur lors de la soumission');
    }
}