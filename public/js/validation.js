// validation.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    if (!form) return;

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
    const requirements = document.querySelectorAll('.requirement');
    
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

    // Navigation entre les étapes
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });
    }

    // Validation de l'étape courante
    function validateStep(stepIndex) {
        switch(stepIndex) {
            case 0:
                return validateFirstStep();
            case 1:
                return validateSecondStep();
            case 2:
                return validateCaptcha();
            default:
                return true;
        }
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
        }

        if (!lastname || lastname.length < 2) {
            showError('lastname', 'Le nom doit contenir au moins 2 caractères');
            isValid = false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Email invalide');
            isValid = false;
        }

        if (!role) {
            showError('role', 'Veuillez sélectionner un rôle');
            isValid = false;
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
        }

        return isValid;
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

    // Soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            // Logique de soumission du formulaire
            console.log('Formulaire soumis avec succès !');
        }
    });
});