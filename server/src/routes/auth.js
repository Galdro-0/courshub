import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        // Check if email already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hash password and create user
        const passwordHash = bcrypt.hashSync(password, 10);
        const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, 'user')
    `).run(email, passwordHash, name);

        const token = generateToken(result.lastInsertRowid);

        res.status(201).json({
            message: 'Compte créé avec succès',
            user: { id: result.lastInsertRowid, email, name, role: 'user' },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Connexion réussie',
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Update profile
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (name) {
            db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId);
        }

        if (currentPassword && newPassword) {
            const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
            const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);

            if (!validPassword) {
                return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
            }

            const newPasswordHash = bcrypt.hashSync(newPassword, 10);
            db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, userId);
        }

        const updatedUser = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(userId);
        res.json({ message: 'Profil mis à jour', user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

export default router;
