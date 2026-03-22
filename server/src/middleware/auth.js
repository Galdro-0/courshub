import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'courshub_secret_key';

// Verify JWT token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(decoded.userId);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid, but we continue without user
        }
    }
    next();
};

// Check if user is owner (admin)
export const isOwner = (req, res, next) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
};

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
