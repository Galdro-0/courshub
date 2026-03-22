import express from 'express';
import db from '../config/database.js';
import { authenticateToken, isOwner } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require owner role
router.use(authenticateToken, isOwner);

// Get dashboard stats
router.get('/stats', (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
        const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
        const totalDownloads = db.prepare('SELECT COUNT(*) as count FROM downloads').get().count;
        const totalRevenue = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM purchases').get().total;

        const recentPurchases = db.prepare(`
      SELECT p.*, u.name as user_name, u.email as user_email, c.title as course_title
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN courses c ON p.course_id = c.id
      ORDER BY p.purchased_at DESC
      LIMIT 10
    `).all();

        const topCourses = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM downloads WHERE course_id = c.id) as download_count,
        (SELECT COUNT(*) FROM purchases WHERE course_id = c.id) as purchase_count
      FROM courses c
      ORDER BY download_count DESC
      LIMIT 5
    `).all();

        res.json({
            stats: {
                totalUsers,
                totalCourses,
                totalDownloads,
                totalRevenue
            },
            recentPurchases,
            topCourses
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// Get all users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.created_at,
        (SELECT COUNT(*) FROM purchases WHERE user_id = u.id) as purchase_count,
        (SELECT COUNT(*) FROM downloads WHERE user_id = u.id) as download_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Get user details with purchases
router.get('/users/:id', (req, res) => {
    try {
        const user = db.prepare(`
      SELECT id, email, name, role, created_at FROM users WHERE id = ?
    `).get(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const purchases = db.prepare(`
      SELECT p.*, c.title as course_title, c.category
      FROM purchases p
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ?
      ORDER BY p.purchased_at DESC
    `).all(user.id);

        const downloads = db.prepare(`
      SELECT d.*, c.title as course_title, c.category
      FROM downloads d
      JOIN courses c ON d.course_id = c.id
      WHERE d.user_id = ?
      ORDER BY d.downloaded_at DESC
    `).all(user.id);

        res.json({ user, purchases, downloads });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
    }
});

// Delete user
router.delete('/users/:id', (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.role === 'owner') {
            return res.status(400).json({ error: 'Impossible de supprimer un administrateur' });
        }

        // Delete related records
        db.prepare('DELETE FROM downloads WHERE user_id = ?').run(user.id);
        db.prepare('DELETE FROM purchases WHERE user_id = ?').run(user.id);
        db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

// Get all downloads
router.get('/downloads', (req, res) => {
    try {
        const downloads = db.prepare(`
      SELECT d.*, u.name as user_name, u.email as user_email, c.title as course_title
      FROM downloads d
      JOIN users u ON d.user_id = u.id
      JOIN courses c ON d.course_id = c.id
      ORDER BY d.downloaded_at DESC
      LIMIT 100
    `).all();

        res.json({ downloads });
    } catch (error) {
        console.error('Get downloads error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des téléchargements' });
    }
});

// Get settings
router.get('/settings', (req, res) => {
    try {
        const settings = db.prepare('SELECT * FROM settings').all();
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        res.json({ settings: settingsObj });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
    }
});

// Update settings
router.put('/settings', (req, res) => {
    try {
        const { payment_enabled, site_name, site_description } = req.body;

        const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

        if (payment_enabled !== undefined) {
            updateSetting.run('payment_enabled', String(payment_enabled));
        }
        if (site_name) {
            updateSetting.run('site_name', site_name);
        }
        if (site_description) {
            updateSetting.run('site_description', site_description);
        }

        res.json({ message: 'Paramètres mis à jour' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
    }
});

export default router;
