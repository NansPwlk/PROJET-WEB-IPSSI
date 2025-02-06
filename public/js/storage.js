// storage.js

class UserStorage {
    constructor() {
        this.users = this.loadUsers();
    }

    // Charger les utilisateurs depuis le localStorage
    loadUsers() {
        const users = localStorage.getItem('quizzeo_users');
        return users ? JSON.parse(users) : [];
    }

    // Sauvegarder les utilisateurs dans le localStorage
    saveUsers() {
        localStorage.setItem('quizzeo_users', JSON.stringify(this.users));
    }

    // Créer un nouvel utilisateur
    createUser(userData) {
        // Vérifier si l'email existe déjà
        if (this.users.some(user => user.email === userData.email)) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Créer un nouvel utilisateur avec un ID unique
        const user = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    // Connecter un utilisateur
    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        if (!user.isActive) {
            throw new Error('Ce compte a été désactivé');
        }

        // Créer une session
        const session = {
            userId: user.id,
            role: user.role,
            token: this.generateToken(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
        };

        localStorage.setItem('quizzeo_current_session', JSON.stringify(session));
        return user;
    }

    // Générer un token unique pour la session
    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Obtenir l'utilisateur actuellement connecté
    getCurrentUser() {
        const session = localStorage.getItem('quizzeo_current_session');
        if (!session) return null;

        const { userId, expiresAt } = JSON.parse(session);
        
        // Vérifier si la session a expiré
        if (new Date(expiresAt) < new Date()) {
            this.logout();
            return null;
        }

        return this.users.find(user => user.id === userId);
    }

    // Déconnecter l'utilisateur
    logout() {
        localStorage.removeItem('quizzeo_current_session');
    }

    // Mettre à jour un utilisateur
    updateUser(userId, userData) {
        const index = this.users.findIndex(user => user.id === userId);
        if (index === -1) throw new Error('Utilisateur non trouvé');

        // Mettre à jour l'utilisateur tout en conservant certaines propriétés
        this.users[index] = {
            ...this.users[index],
            ...userData,
            updatedAt: new Date().toISOString()
        };

        this.saveUsers();
        return this.users[index];
    }

    // Supprimer un utilisateur
    deleteUser(userId) {
        this.users = this.users.filter(user => user.id !== userId);
        this.saveUsers();
    }

    // Désactiver un compte utilisateur
    deactivateUser(userId) {
        const user = this.users.find(user => user.id === userId);
        if (user) {
            user.isActive = false;
            user.updatedAt = new Date().toISOString();
            this.saveUsers();
        }
    }

    // Activer un compte utilisateur
    activateUser(userId) {
        const user = this.users.find(user => user.id === userId);
        if (user) {
            user.isActive = true;
            user.updatedAt = new Date().toISOString();
            this.saveUsers();
        }
    }

    // Vérifier si l'utilisateur a un rôle spécifique
    hasRole(userId, role) {
        const user = this.users.find(user => user.id === userId);
        return user ? user.role === role : false;
    }

    // Réinitialiser le mot de passe (simulation)
    resetPassword(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('Aucun utilisateur trouvé avec cet email');
        }
        // Dans un vrai système, envoyez un email avec un lien de réinitialisation
        console.log('Un email de réinitialisation a été envoyé (simulation)');
    }
}

// Créer une instance globale pour l'utiliser partout
window.userStorage = new UserStorage();


// Exemple d'utilisation:
/*
try {
    // Créer un compte
    const newUser = window.userStorage.createUser({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'ecole'
    });

    // Se connecter
    const loggedUser = window.userStorage.loginUser('john@example.com', 'Password123!');

    // Vérifier l'utilisateur actuel
    const currentUser = window.userStorage.getCurrentUser();

    // Se déconnecter
    window.userStorage.logout();
} catch (error) {
    console.error('Erreur:', error.message);
}
*/