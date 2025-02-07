document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quizForm');
    form.addEventListener('submit', handleSubmit);
});

let questionCount = 0;

function addQuestion(type) {
    const container = document.getElementById('questions');
    const template = document.getElementById(`${type}-question-template`);
    const clone = template.content.cloneNode(true);
    
    questionCount++;
    clone.querySelector('.question-number').textContent = questionCount;
    
    // Mettre à jour les identifiants uniques
    const timestamp = Date.now();
    clone.querySelectorAll('[name*="_$INDEX"]').forEach(element => {
        element.name = element.name.replace('$INDEX', timestamp);
    });

    container.appendChild(clone);
}

function deleteQuestion(button) {
    const questionBox = button.closest('.question-box');
    questionBox.remove();
    updateQuestionNumbers();
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-number');
    questions.forEach((question, index) => {
        question.textContent = index + 1;
    });
    questionCount = questions.length;
}

async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    
    // Ajouter le titre
    formData.append('title', document.getElementById('quiz-title').value);
    
    // Récupérer toutes les questions
    const questions = [];
    document.querySelectorAll('.question-box').forEach(questionBox => {
        const questionData = {
            type: questionBox.dataset.type,
            question: questionBox.querySelector('input[name="questions[]"]').value,
            points: questionBox.querySelector('input[name="points[]"]').value
        };

        if (questionData.type === 'qcm') {
            const options = [];
            questionBox.querySelectorAll('input[name*="options_"]').forEach(option => {
                options.push(option.value);
            });
            questionData.options = options;
            
            const correctAnswer = questionBox.querySelector('input[type="radio"]:checked');
            questionData.correct_answer = correctAnswer ? correctAnswer.value : null;
        } else {
            questionData.description = questionBox.querySelector('textarea').value;
        }

        questions.push(questionData);
    });

    formData.append('questions', JSON.stringify(questions));
    formData.append('status', 'active');
    
    try {
        const response = await fetch('/php/quiz/save_company_quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/public/entreprise-dashboard.html';
        } else {
            alert(data.error || 'Erreur lors de la création du quiz');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du quiz');
    }
}

async function saveAsDraft() {
    const formData = new FormData(document.getElementById('quizForm'));
    formData.append('status', 'draft');
    
    try {
        const response = await fetch('/php/quiz/save_company_quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/public/entreprise-dashboard.html';
        } else {
            alert(data.error || 'Erreur lors de la sauvegarde du brouillon');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde du brouillon');
    }
}