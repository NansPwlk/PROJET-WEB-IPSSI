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
            displayQuiz(data.quiz);
        } else {
            alert('Quiz non trouvé');
            window.location.href = '/public/ecole-dashboard.html';
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du quiz');
    }
});

function displayQuiz(quiz) {
    document.getElementById('quiz-title').textContent = quiz.title;
    document.querySelector('.quiz-creator').textContent = `Créé par : ${quiz.creator_name}`;
    document.querySelector('.quiz-date').textContent = 
        `Date de création : ${new Date(quiz.created_at).toLocaleDateString()}`;

    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = quiz.questions.map((question, index) => `
        <div class="question-box">
            <h3>Question ${index + 1}</h3>
            <p class="question-text">${question.question}</p>
            <p class="points">Points : ${question.points}</p>
            <div class="options-list">
                ${question.options.map((option, optIndex) => `
                    <div class="option ${optIndex === question.correct_answer ? 'correct' : ''}">
                        ${option}
                        ${optIndex === question.correct_answer ? ' ✓' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    if (quiz.responses && quiz.responses.length > 0) {
        displayResponses(quiz.responses);
    }
}

function displayResponses(responses) {
    const responsesList = document.getElementById('responses-list');
    responsesList.innerHTML = responses.map(response => `
        <div class="response-card">
            <div class="student-info">
                <span class="student-name">${response.student_name}</span>
                <span class="score">${response.score}/${response.total_points}</span>
            </div>
            <div class="submission-date">
                Soumis le : ${new Date(response.submitted_at).toLocaleString()}
            </div>
        </div>
    `).join('');
}