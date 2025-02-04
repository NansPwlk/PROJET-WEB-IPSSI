

class Captcha {
    constructor() {
        this.currentChallenge = null;
        this.challengeContainer = document.querySelector('.captcha-challenge');
        this.isVerified = false;
        
        // Initialisation une fois le DOM chargé
        this.init();
    }

    init() {
        // Créer la structure du captcha
        this.createCaptchaStructure();
        
        // Ajouter les événements
        const checkbox = document.querySelector('.captcha-checkbox input');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.startChallenge();
                }
            });
        }
    }

    createCaptchaStructure() {
        const container = document.createElement('div');
        container.className = 'captcha-wrapper';
        container.innerHTML = `
            <div class="captcha-initial">
                <label class="captcha-checkbox">
                    <input type="checkbox">
                    <span class="checkmark"></span>
                    Je ne suis pas un robot
                </label>
            </div>
            <div class="captcha-challenge" style="display: none;">
                <div class="challenge-title">
                    Complétez le défi de sécurité
                    <button type="button" class="refresh-btn">↻</button>
                </div>
                <div class="challenge-content"></div>
                <div class="challenge-message"></div>
            </div>
        `;

        // Ajouter à l'élément approprié dans le formulaire
        const targetElement = document.querySelector('.captcha-container');
        if (targetElement) {
            targetElement.appendChild(container);
        }

        // Ajouter l'événement de rafraîchissement
        const refreshBtn = container.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.startChallenge());
        }
    }

    startChallenge() {
        // Sélectionner un défi aléatoire
        const challenges = ['puzzle', 'sequence'];
        const selectedChallenge = challenges[Math.floor(Math.random() * challenges.length)];

        this.currentChallenge = selectedChallenge;
        document.querySelector('.captcha-initial').style.display = 'none';
        document.querySelector('.captcha-challenge').style.display = 'block';

        const contentContainer = document.querySelector('.challenge-content');
        contentContainer.innerHTML = '';

        switch (selectedChallenge) {
            case 'puzzle':
                this.createPuzzleChallenge(contentContainer);
                break;
            case 'sequence':
                this.createSequenceChallenge(contentContainer);
                break;
        }
    }

    createPuzzleChallenge(container) {
        this.solution = Math.floor(Math.random() * 100) + 50; // Position cible aléatoire
        
        container.innerHTML = `
            <div class="puzzle-container">
                <div class="puzzle-track">
                    <div class="puzzle-piece" draggable="true"></div>
                </div>
                <div class="puzzle-target" style="left: ${this.solution}px"></div>
            </div>
        `;

        const piece = container.querySelector('.puzzle-piece');
        let isDragging = false;
        let startX, pieceLeft;

        piece.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.clientX - piece.offsetLeft;
            piece.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            
            e.preventDefault();
            pieceLeft = e.clientX - startX;
            pieceLeft = Math.max(0, Math.min(pieceLeft, 200)); // Limiter le mouvement
            piece.style.left = pieceLeft + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            piece.style.cursor = 'grab';
            
            // Vérifier si le puzzle est résolu
            if (Math.abs(pieceLeft - this.solution) < 10) {
                this.onSuccess();
            } else {
                this.showMessage('Essayez encore', 'error');
            }
        });
    }

    createSequenceChallenge(container) {
        const symbols = ['★', '◆', '●', '▲', '■'];
        const sequence = Array.from({length: 4}, () => symbols[Math.floor(Math.random() * symbols.length)]);
        this.solution = [...sequence];

        container.innerHTML = `
            <div class="sequence-container">
                <div class="sequence-display">
                    ${sequence.map(s => `<span class="symbol">${s}</span>`).join('')}
                </div>
                <div class="sequence-input"></div>
                <div class="symbol-buttons">
                    ${symbols.map(s => `<button type="button" class="symbol-btn">${s}</button>`).join('')}
                </div>
            </div>
        `;

        const input = container.querySelector('.sequence-input');
        const userSequence = [];

        container.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (userSequence.length < sequence.length) {
                    userSequence.push(btn.textContent);
                    input.innerHTML += `<span class="symbol">${btn.textContent}</span>`;

                    if (userSequence.length === sequence.length) {
                        if (userSequence.every((s, i) => s === sequence[i])) {
                            this.onSuccess();
                        } else {
                            userSequence.length = 0;
                            input.innerHTML = '';
                            this.showMessage('Séquence incorrecte', 'error');
                        }
                    }
                }
            });
        });
    }

    onSuccess() {
        this.isVerified = true;
        this.showMessage('Vérifié !', 'success');
        
        // Retour à l'état initial mais vérifié
        setTimeout(() => {
            document.querySelector('.captcha-challenge').style.display = 'none';
            document.querySelector('.captcha-initial').style.display = 'flex';
            document.querySelector('.captcha-checkbox input').checked = true;
            
            // Activer le bouton d'inscription
            const registerBtn = document.querySelector('button[type="submit"]');
            if (registerBtn) registerBtn.disabled = false;
        }, 1000);
    }

    showMessage(text, type = 'info') {
        const messageEl = document.querySelector('.challenge-message');
        messageEl.textContent = text;
        messageEl.className = `challenge-message ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'challenge-message';
            }, 2000);
        }
    }

    verify() {
        return this.isVerified;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.captcha = new Captcha();
});