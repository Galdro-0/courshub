import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Check if payment is enabled
const isPaymentEnabled = () => {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('payment_enabled');
    return setting && setting.value === 'true';
};

// Get user's purchases
router.get('/purchases', authenticateToken, (req, res) => {
    try {
        const purchases = db.prepare(`
      SELECT p.*, c.title, c.description, c.category, c.file_type, c.is_free
      FROM purchases p
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ?
      ORDER BY p.purchased_at DESC
    `).all(req.user.id);

        res.json({ purchases });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des achats' });
    }
});

// Check if user owns a course
router.get('/check/:courseId', authenticateToken, (req, res) => {
    try {
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.courseId);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        // Owner always has access
        if (req.user.role === 'owner') {
            return res.json({ hasAccess: true, isFree: true });
        }

        // Free courses
        if (course.is_free) {
            return res.json({ hasAccess: true, isFree: true });
        }

        // Check purchase
        const purchase = db.prepare('SELECT id FROM purchases WHERE user_id = ? AND course_id = ?')
            .get(req.user.id, course.id);

        res.json({
            hasAccess: !!purchase,
            isFree: false,
            price: course.price,
            purchased: !!purchase
        });
    } catch (error) {
        console.error('Check access error:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
});

// Simulate payment (for testing)
router.post('/simulate', authenticateToken, (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ error: 'ID du cours requis' });
        }

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        if (course.is_free) {
            return res.status(400).json({ error: 'Ce cours est gratuit' });
        }

        // Check if already purchased
        const existingPurchase = db.prepare('SELECT id FROM purchases WHERE user_id = ? AND course_id = ?')
            .get(req.user.id, course.id);

        if (existingPurchase) {
            return res.status(400).json({ error: 'Vous avez déjà acheté ce cours' });
        }

        // Check if payment is enabled
        if (!isPaymentEnabled()) {
            return res.status(400).json({ error: 'Les paiements sont désactivés' });
        }

        // Simulate successful payment
        const paymentId = `sim_${uuidv4()}`;

        db.prepare(`
      INSERT INTO purchases (user_id, course_id, amount, payment_id, payment_method)
      VALUES (?, ?, ?, ?, 'simulation')
    `).run(req.user.id, course.id, course.price, paymentId);

        res.json({
            success: true,
            message: 'Paiement simulé avec succès',
            paymentId
        });
    } catch (error) {
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: 'Erreur lors du paiement' });
    }
});

// Create Stripe checkout session (placeholder for real Stripe integration)
router.post('/create-checkout', authenticateToken, (req, res) => {
    try {
        const { courseId } = req.body;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        if (course.is_free) {
            return res.status(400).json({ error: 'Ce cours est gratuit' });
        }

        // For now, redirect to simulation
        // In production, this would create a real Stripe checkout session
        res.json({
            message: 'Stripe non configuré - utilisez le mode simulation',
            simulationUrl: `/api/payment/simulate`,
            courseId: course.id,
            amount: course.price
        });
    } catch (error) {
        console.error('Create checkout error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    }
});

// Webhook for Stripe (placeholder)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    // Placeholder for Stripe webhook handling
    res.json({ received: true });
});

export default router;
