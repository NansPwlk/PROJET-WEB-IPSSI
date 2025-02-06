// create-quiz.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quizForm');
    form.addEventListener('submit', handleSubmit);
    addQuestion(); // Ajouter une première question par défaut
});

let questionCount = 0;

function addQuestion() {
    const container = document.getElementById('questions');
    const template = document.getElementById('question-template');
    const clone = template.content.cloneNode(true);
    
    questionCount++;
    clone.querySelector('.question-number').textContent = questionCount;
    
    // Mettre à jour les noms des champs
    const index = Date.now(); // Utiliser timestamp comme identifiant unique
    clone.querySelectorAll('[name*="_$INDEX"]').forEach(element => {
        element.name = element.name.replace('$INDEX', index);
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
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/php/quiz/save_quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/public/ecole-dashboard.html';
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
        const response = await fetch('/php/quiz/save_quiz.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/public/ecole-dashboard.html';
        } else {
            alert(data.error || 'Erreur lors de la sauvegarde du brouillon');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde du brouillon');
    }
}