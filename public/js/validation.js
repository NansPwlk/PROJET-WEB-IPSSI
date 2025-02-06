document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initializeRegistrationForm();
    }

    // Vérifier si nous sommes sur la page de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initializeLoginForm();
    }
});

// Initialisation du formulaire de connexion
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Récupérer les données du formulaire
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Réinitialiser les messages d'erreur
        hideError('email');
        hideError('password');

        try {
            const response = await fetch('/php/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirection selon le rôle
                window.location.href = data.redirect;
            } else {
                // Afficher l'erreur appropriée
                if (data.error.includes('Email')) {
                    showError('email', data.error);
                } else if (data.error.includes('mot de passe')) {
                    showError('password', data.error);
                } else {
                    // Erreur générale
                    showError('email', data.error);
                }
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showError('email', 'Erreur de connexion au serveur');
        }
    });
}

// Initialisation du formulaire d'inscription
function initializeRegistrationForm() {
    // Gestion des étapes
    const steps = Array.from(document.getElementsByClassName('form-step'));
    let currentStep = 0;

    // Boutons de navigation
    const nextButtons = document.querySelectorAll('.next-button');
    const backButtons = document.querySelectorAll('.back-button');
    
    // Validation du mot de passe
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthBar = document.querySelector('.strength-progress');
    const strengthText = document.querySelector('.strength-text');
    
    // Toggle visibilité du mot de passe
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // Critères de validation du mot de passe
    const passwordCriteria = {
        length: (str) => str.length >= 8,
        uppercase: (str) => /[A-Z]/.test(str),
        lowercase: (str) => /[a-z]/.test(str),
        number: (str) => /[0-9]/.test(str),
        special: (str) => /[^A-Za-z0-9]/.test(str)
    };

    // Navigation entre les étapes
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.style.display = 'block';
                step.classList.add('active');
                step.classList.remove('inactive');
            } else {
                step.style.display = 'none';
                step.classList.remove('active');
                step.classList.add('inactive');
            }
        });
    }

    // Validation du mot de passe en temps réel
    function validatePassword(password) {
        let strength = 0;
        let validCriteria = 0;

        Object.entries(passwordCriteria).forEach(([criterion, validateFn]) => {
            const requirement = document.querySelector(`[data-requirement="${criterion}"]`);
            const isValid = validateFn(password);
            
            if (isValid) {
                requirement.classList.add('valid');
                validCriteria++;
            } else {
                requirement.classList.remove('valid');
            }
        });

        strength = (validCriteria / Object.keys(passwordCriteria).length) * 100;
        
        // Mise à jour de la barre de force
        strengthBar.style.width = `${strength}%`;
        if (strength <= 25) {
            strengthBar.style.backgroundColor = '#ef4444';
            strengthText.textContent = 'Faible';
        } else if (strength <= 50) {
            strengthBar.style.backgroundColor = '#f59e0b';
            strengthText.textContent = 'Moyen';
        } else if (strength <= 75) {
            strengthBar.style.backgroundColor = '#10b981';
            strengthText.textContent = 'Fort';
        } else {
            strengthBar.style.backgroundColor = '#059669';
            strengthText.textContent = 'Très fort';
        }

        return validCriteria === Object.keys(passwordCriteria).length;
    }

    function validateFirstStep() {
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;

        let isValid = true;

        if (!firstname || firstname.length < 2) {
            showError('firstname', 'Le prénom doit contenir au moins 2 caractères');
            isValid = false;
        } else {
            hideError('firstname');
        }

        if (!lastname || lastname.length < 2) {
            showError('lastname', 'Le nom doit contenir au moins 2 caractères');
            isValid = false;
        } else {
            hideError('lastname');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Email invalide');
            isValid = false;
        } else {
            hideError('email');
        }

        if (!role) {
            showError('role', 'Veuillez sélectionner un rôle');
            isValid = false;
        } else {
            hideError('role');
        }

        return isValid;
    }

    function validateSecondStep() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        let isValid = validatePassword(password);

        if (password !== confirmPassword) {
            showError('confirm-password', 'Les mots de passe ne correspondent pas');
            isValid = false;
        } else {
            hideError('confirm-password');
        }

        return isValid;
    }

    // Validation de l'étape courante
    function validateStep(stepIndex) {
        switch(stepIndex) {
            case 0:
                return validateFirstStep();
            case 1:
                return validateSecondStep();
            case 2:
                return true; // La validation du CAPTCHA est gérée séparément
            default:
                return true;
        }
    }

    // Événements de validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                showError('confirm-password', 'Les mots de passe ne correspondent pas');
            } else {
                hideError('confirm-password');
            }
        });
    }

    // Navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
        });
    });

    // Initialize
    showStep(currentStep);

    // Validation en temps réel des champs de la première étape
    ['firstname', 'lastname', 'email'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    hideError(fieldId);
                }
            });
        }
    });

    // Validation du rôle
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            if (roleSelect.value) {
                hideError('role');
            }
        });
    }
}

// Fonctions utilitaires pour les messages d'erreur
function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(inputId) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}