document.addEventListener('DOMContentLoaded', function() {
    console.log("Captcha.js chargé !"); 
    
    const captchaQuestion = document.getElementById('captcha-question');
    const captchaInput = document.getElementById('captcha-answer');
    const refreshButton = document.getElementById('refresh-captcha');
    const validateButton = document.getElementById('validate-captcha');
    const confirmButton = document.getElementById('confirm-registration');

    async function loadCaptcha() {
        console.log("Chargement du Captcha..."); 
        captchaQuestion.textContent = "Chargement...";

        try {
            const response = await fetch('/captcha/php/captcha.php');
            if (!response.ok) throw new Error('Erreur réseau');
            
            const data = await response.json();
            console.log("Réponse du serveur Captcha:", data);
            
            if (data.question) {
                captchaQuestion.textContent = data.question;
            } else {
                throw new Error('Pas de question dans la réponse');
            }
        } catch (error) {
            console.error("Erreur de requête Captcha:", error);
            captchaQuestion.textContent = "Erreur de chargement du captcha. Cliquez sur 🔄 pour réessayer.";
        }
        
        if (captchaInput) {
            captchaInput.value = "";
        }
        // Réinitialiser l'état
        confirmButton.style.display = 'none';
        updateCaptchaStatus('waiting', 'En attente de validation');
    }

    function updateCaptchaStatus(status, message) {
        const statusElement = document.getElementById('captcha-status');
        
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'captcha-status ' + status;
        }
        
        if (confirmButton) {
            confirmButton.style.display = status === 'success' ? 'block' : 'none';
        }
    }

    async function validateCaptcha() {
        if (!captchaInput || !captchaInput.value) {
            updateCaptchaStatus('error', 'Veuillez entrer une réponse');
            return false;
        }

        validateButton.disabled = true;
        try {
            const response = await fetch('/captcha/php/captcha.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'captcha_answer': captchaInput.value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                updateCaptchaStatus('success', '✅ CAPTCHA validé');
                confirmButton.style.display = 'block';
                return true;
            } else {
                updateCaptchaStatus('error', '❌ Réponse incorrecte');
                captchaInput.value = '';
                loadCaptcha();
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            updateCaptchaStatus('error', '❌ Erreur de validation');
            return false;
        } finally {
            validateButton.disabled = false;
        }
    }

    // Initialisation des événements
    if (refreshButton) {
        refreshButton.addEventListener('click', loadCaptcha);
    }

    if (validateButton) {
        validateButton.addEventListener('click', validateCaptcha);
    }

    // Gestion de la touche Entrée dans l'input
    if (captchaInput) {
        captchaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                validateCaptcha();
            }
        });
    }

    // Gestionnaire pour le bouton de confirmation
    if (confirmButton) {
        confirmButton.addEventListener('click', async function() {
            const form = document.getElementById('registerForm');
            if (!form) return;

            const formData = new FormData(form);
            
            try {
                const response = await fetch('/captcha/php/save_user.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const userRole = formData.get('role');
                    if (userRole === 'utilisateur') {
                        window.location.href = '../success-page.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                } else {
                    alert('Erreur : ' + (data.error || 'Une erreur est survenue'));
                }
            } catch (error) {
                console.error('Erreur lors de l\'inscription:', error);
                alert('Erreur lors de l\'inscription');
            }
        });
    }

    // Charger le CAPTCHA initialement
    const step3 = document.getElementById('step3');
    if (step3 && window.getComputedStyle(step3).display !== 'none') {
        loadCaptcha();
    }

    // Observer les changements de visibilité de step3
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'step3' && 
                window.getComputedStyle(mutation.target).display !== 'none') {
                loadCaptcha();
            }
        });
    });

    if (step3) {
        observer.observe(step3, { 
            attributes: true, 
            attributeFilter: ['style', 'class']
        });
    }
});