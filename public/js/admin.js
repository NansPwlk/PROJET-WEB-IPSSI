document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons et contenus
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            button.classList.add('active');
            const tabId = button.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');

            // Charger les données appropriées
            switch(button.dataset.tab) {
                case 'users':
                    loadUsers();
                    break;
                case 'quizzes':
                    loadQuizzes();
                    break;
                case 'connected':
                    loadConnectedUsers();
                    break;
            }
        });
    });

    // Chargement des utilisateurs
    async function loadUsers() {
        const response = await fetch('/php/admin/get-users.php');
        const users = await response.json();
        const usersList = document.getElementById('users-list');
        
        usersList.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstname} ${user.lastname}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        ${user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <button 
                        class="action-button ${user.isActive ? 'deactivate' : 'activate'}"
                        onclick='toggleUserStatus("${user.id || ''}", ${Boolean(user.isActive)})'
                    >
                        ${user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Chargement des quiz
    async function loadQuizzes() {
        const response = await fetch('/admin/get-quizzes.php');
        const quizzes = await response.json();
        const quizzesList = document.getElementById('quizzes-list');
        
        quizzesList.innerHTML = quizzes.map(quiz => `
            <tr>
                <td>${quiz.title}</td>
                <td>${quiz.creator_name}</td>
                <td>${quiz.type}</td>
                <td>${quiz.status}</td>
                <td>${quiz.responses_count}</td>
                <td>
                    <button 
                        class="action-button ${quiz.isActive ? 'deactivate' : 'activate'}"
                        onclick="toggleQuizStatus('${quiz.id}', ${quiz.isActive})"
                    >
                        ${quiz.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Chargement des utilisateurs connectés
    async function loadConnectedUsers() {
        const response = await fetch('/admin/get-connected-users.php');
        const connectedUsers = await response.json();
        const connectedList = document.getElementById('connected-users-list');
        
        connectedList.innerHTML = connectedUsers.map(user => `
            <div class="connected-user-card">
                <h3>${user.firstname} ${user.lastname}</h3>
                <p>Rôle : ${user.role}</p>
                <p>Connecté depuis : ${new Date(user.connected_at).toLocaleTimeString()}</p>
            </div>
        `).join('');
    }

    // Recherche d'utilisateurs
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(function() {
            loadUsers(this.value);
        }, 300));
    }

    // Recherche de quiz
    const quizSearch = document.getElementById('quiz-search');
    if (quizSearch) {
        quizSearch.addEventListener('input', debounce(function() {
            loadQuizzes(this.value);
        }, 300));
    }

    // Fonction utilitaire pour debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Actions sur les utilisateurs et quiz
    window.toggleUserStatus = async function(userId, currentStatus) {
        console.log("🚀 Fonction toggleUserStatus appelée avec:", { userId, currentStatus }); // Debug
    
        try {
            console.log("📫 Envoi de la requête à toggle-user-status.php");
            const response = await fetch('/php/admin/toggle-user-status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, status: !currentStatus })
            });
            
            console.log("📬 Réponse reçue:", response);
            
            if (response.ok) {
                console.log("✅ Statut modifié avec succès");
                loadUsers(); // Recharger la liste
            } else {
                const errorData = await response.json();
                console.error("❌ Erreur serveur:", errorData);
                alert('Erreur lors de la modification du statut');
            }
        } catch (error) {
            console.error("🔥 Erreur:", error);
            alert('Erreur lors de la modification du statut');
        }
    };

    window.toggleQuizStatus = async function(quizId, currentStatus) {
        try {
            const response = await fetch('/admin/toggle-quiz-status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quizId, status: !currentStatus })
            });
            
            if (response.ok) {
                loadQuizzes(); // Recharger la liste
            } else {
                alert('Erreur lors de la modification du statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du statut');
        }
    };

    // Charger les utilisateurs par défaut
    loadUsers();
});