document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    
    // Récupérer et afficher les données de l'utilisateur
    fetch('/php/auth/get_user.php')
        .then(response => response.json())
        .then(user => {
            document.getElementById('firstname').value = user.firstname;
            document.getElementById('lastname').value = user.lastname;
            document.getElementById('email').value = user.email;
        });

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Réinitialiser les messages d'erreur
        ['firstname', 'lastname', 'email', 'new-password', 'confirm-password']
            .forEach(id => document.getElementById(`${id}-error`).style.display = 'none');

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Vérification de la correspondance des mots de passe
        if (newPassword !== confirmPassword) {
            showError('confirm-password', 'Les mots de passe ne correspondent pas');
            return;
        }

        // Préparation des données
        const data = {
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            email: document.getElementById('email').value
        };

        if (newPassword) {
            data.password = newPassword;
        }

        try {
            const response = await fetch('/php/auth/update-profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Profil mis à jour avec succès');
                window.location.href = 'home.html';
            } else {
                // Affichage des erreurs selon le champ concerné
                const errorField = result.error.toLowerCase().includes('mot de passe') ? 'new-password' : 
                                 result.error.toLowerCase().includes('email') ? 'email' :
                                 result.error.toLowerCase().includes('prénom') ? 'firstname' : 
                                 result.error.toLowerCase().includes('nom') ? 'lastname' : 'email';
                showError(errorField, result.error);
            }
        } catch (error) {
            alert('Erreur lors de la mise à jour du profil');
        }
    });
});

function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}