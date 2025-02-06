document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    
    if (!quizId) {
        window.location.href = '/public/ecole-dashboard.html';
        return;
    }

    try {
        const response = await fetch(`/php/quiz/get_quiz.php?id=${quizId}`);
        const data = await response.json();

        if (data.success) {
            loadQuizForEditing(data.quiz);
        } else {
            alert('Quiz non trouvé');
            window.location.href = '/public/ecole-dashboard.html';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du quiz');
    }
});

function loadQuizForEditing(quiz) {
    document.getElementById('quiz-title').value = quiz.title;
    
    const container = document.getElementById('questions-container');
    quiz.questions.forEach((question, index) => {
        container.appendChild(createQuestionElement(question, index));
    });

    document.getElementById('editQuizForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuiz(quiz.id);
    });
}

function createQuestionElement(question, index) {
    const div = document.createElement('div');
    div.className = 'question-box';
    div.innerHTML = `
        <div class="question-header">
            <h3>Question ${index + 1}</h3>
            <button type="button" class="delete-question" onclick="deleteQuestion(this)">×</button>
        </div>
        <div class="input-group">
            <label>Question</label>
            <input type="text" name="questions[]" value="${question.question}" required>
        </div>
        <div class="input-group">
            <label>Points</label>
            <input type="number" name="points[]" value="${question.points}" min="1" required>
        </div>
        <div class="options-container">
            ${question.options.map((option, optIndex) => `
                <div class="option">
                    <input type="radio" name="correct_answer_${index}" value="${optIndex}" 
                        ${optIndex === question.correct_answer ? 'checked' : ''}>
                    <input type="text" name="options_${index}[]" value="${option}" required>
                </div>
            `).join('')}
        </div>
    `;
    return div;
}

async function saveQuiz(quizId) {
    const formData = new FormData(document.getElementById('editQuizForm'));
    formData.append('quiz_id', quizId);
    
    try {
        const response = await fetch('/php/quiz/update_quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/public/ecole-dashboard.html';
        } else {
            alert(data.error || 'Erreur lors de la mise à jour du quiz');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour du quiz');
    }
}

function deleteQuestion(button) {
    const questionBox = button.closest('.question-box');
    questionBox.remove();
    updateQuestionNumbers();
}

function updateQuestionNumbers() {
    document.querySelectorAll('.question-box').forEach((box, index) => {
        box.querySelector('h3').textContent = `Question ${index + 1}`;
    });
}

function addQuestion() {
    const container = document.getElementById('questions-container');
    const index = container.children.length;
    container.appendChild(createQuestionElement({
        question: '',
        points: 1,
        options: ['', '', '', ''],
        correct_answer: 0
    }, index));
}