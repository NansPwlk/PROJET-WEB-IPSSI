const questions = [
    {
        question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?",
        options: ["<href>", "<a>", "<link>", "<url>"],
        correct: 1
    },
    {
        question: "Quelle propriété CSS est utilisée pour changer la couleur du texte ?",
        options: ["text-style", "font-color", "text-color", "color"],
        correct: 3
    },
    {
        question: "Comment sélectionner tous les éléments de classe 'example' en CSS ?",
        options: ["example", "*example", "#example", ".example"],
        correct: 3
    },
    {
        question: "Quelle balise HTML est utilisée pour créer une liste non ordonnée ?",
        options: ["<list>", "<ol>", "<ul>", "<li>"],
        correct: 2
    },
    {
        question: "Quelle propriété CSS est utilisée pour changer la taille de la police ?",
        options: ["font-size", "font-height", "text-size", "size"],
        correct: 0
    },
    {
        question: "Quel est le sélecteur CSS pour un élément avec id='header' ?",
        options: ["@header", "header", "#header", ".header"],
        correct: 2
    },
    {
        question: "Quelle balise HTML définit le titre d'une page web ?",
        options: ["<header>", "<title>", "<head>", "<h1>"],
        correct: 1
    },
    {
        question: "Quelle propriété CSS est utilisée pour changer la couleur d'arrière-plan ?",
        options: ["bg-color", "bgcolor", "background-color", "color-background"],
        correct: 2
    },
    {
        question: "Comment centrer un élément horizontalement en CSS ?",
        options: ["margin: 0 auto;", "text-align: center;", "center: true;", "align: center;"],
        correct: 0
    },
    {
        question: "Quelle balise HTML est utilisée pour insérer une image ?",
        options: ["<src>", "<picture>", "<image>", "<img>"],
        correct: 3
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;
let questionResults = [];

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const nextButton = document.getElementById('next-btn');
const finalScreen = document.getElementById('final-screen');
const quizScreen = document.getElementById('quiz-screen');
const scoreValue = document.getElementById('score-value');
const questionsReview = document.getElementById('questions-review');

function loadQuestion() {
    const question = questions[currentQuestion];
    questionText.textContent = `Question ${currentQuestion + 1}/10: ${question.question}`;
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.addEventListener('click', () => selectOption(button, index === question.correct));
        optionsContainer.appendChild(button);
    });

    answered = false;
    nextButton.style.display = 'none';
}

function selectOption(selectedButton, isCorrect) {
    if (answered) return;
    
    const buttons = optionsContainer.getElementsByClassName('option-button');
    const correctIndex = questions[currentQuestion].correct;
    
    [...buttons].forEach((button, index) => {
        if (index === correctIndex) {
            button.style.backgroundColor = '#10b981';
            button.style.borderColor = '#10b981';
            button.style.color = 'white';
        } else if (button === selectedButton && !isCorrect) {
            button.style.backgroundColor = '#ef4444';
            button.style.borderColor = '#ef4444';
            button.style.color = 'white';
        }
    });

    if (isCorrect) score++;
    questionResults.push(isCorrect);
    
    answered = true;
    nextButton.style.display = 'block';

    if (currentQuestion === questions.length - 1) {
        nextButton.textContent = 'Voir le résultat';
    }
}

function showFinalScreen() {
    quizScreen.style.display = 'none';
    finalScreen.style.display = 'block';
    scoreValue.textContent = score;

    questionsReview.innerHTML = questionResults.map((result, index) => `
        <div class="question-result">
            <div class="result-indicator ${result ? 'correct' : 'incorrect'}"></div>
            <div>Question N°${index + 1}</div>
        </div>
    `).join('');
}

nextButton.addEventListener('click', () => {
    if (!answered) return;
    if (currentQuestion === questions.length - 1) {
        showFinalScreen();
    } else {
        currentQuestion++;
        loadQuestion();
    }
});

loadQuestion();