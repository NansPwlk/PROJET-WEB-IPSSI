// captcha.js

let captchaAnswer = null;

// Génère une question de captcha aléatoire
function generateCaptcha() {
    const operations = [
        () => {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            captchaAnswer = num1 + num2;
            return `Combien font ${num1} + ${num2} ?`;
        },
        () => {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * num1) + 1;
            captchaAnswer = num1 - num2;
            return `Combien font ${num1} - ${num2} ?`;
        },
        () => {
            const words = ['chat', 'chien', 'maison', 'voiture', 'livre'];
            const word = words[Math.floor(Math.random() * words.length)];
            captchaAnswer = word.length;
            return `Combien y a-t-il de lettres dans le mot "${word}" ?`;
        }
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    const captchaQuestion = document.getElementById('captcha-question');
    if (captchaQuestion) {
        captchaQuestion.textContent = operation();
    }
}

// Valide la réponse du captcha
function validateCaptcha() {
    const userAnswer = document.getElementById('captcha-answer')?.value;
    
    if (!userAnswer) {
        showError('captcha', 'Veuillez répondre au captcha');
        return false;
    }

    if (parseInt(userAnswer) !== captchaAnswer) {
        showError('captcha', 'La réponse est incorrecte');
        generateCaptcha();
        document.getElementById('captcha-answer').value = '';
        return false;
    }

    hideError('captcha');
    return true;
}

// Initialisation du captcha
document.addEventListener('DOMContentLoaded', function() {
    const captchaQuestion = document.getElementById('captcha-question');
    if (captchaQuestion) {
        generateCaptcha();
        
        // Permet de rafraîchir le captcha en cliquant dessus
        captchaQuestion.addEventListener('click', function() {
            generateCaptcha();
            const captchaAnswer = document.getElementById('captcha-answer');
            if (captchaAnswer) {
                captchaAnswer.value = '';
            }
            hideError('captcha');
        });
    }
});