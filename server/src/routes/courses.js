import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken, optionalAuth, isOwner } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const uploadsDir = join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-zip-compressed',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'), false);
        }
    }
});

// Get all courses (public with optional auth)
router.get('/', optionalAuth, (req, res) => {
    try {
        const { category, free, search } = req.query;

        let query = `
      SELECT c.*, u.name as owner_name,
        (SELECT COUNT(*) FROM downloads WHERE course_id = c.id) as download_count
      FROM courses c
      JOIN users u ON c.owner_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (category) {
            query += ' AND c.category = ?';
            params.push(category);
        }

        if (free === 'true') {
            query += ' AND c.is_free = 1';
        } else if (free === 'false') {
            query += ' AND c.is_free = 0';
        }

        if (search) {
            query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY c.created_at DESC';

        const courses = db.prepare(query).all(...params);

        // Add purchase status for authenticated users
        if (req.user) {
            const userPurchases = db.prepare('SELECT course_id FROM purchases WHERE user_id = ?')
                .all(req.user.id)
                .map(p => p.course_id);

            courses.forEach(course => {
                course.purchased = userPurchases.includes(course.id);
            });
        }

        res.json({ courses });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des cours' });
    }
});

// Get categories
router.get('/categories', (req, res) => {
    try {
        const categories = db.prepare(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM courses
      GROUP BY category
      ORDER BY count DESC
    `).all();

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
});

// Get single course
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const course = db.prepare(`
      SELECT c.*, u.name as owner_name,
        (SELECT COUNT(*) FROM downloads WHERE course_id = c.id) as download_count
      FROM courses c
      JOIN users u ON c.owner_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        // Check if user purchased
        if (req.user) {
            const purchase = db.prepare('SELECT id FROM purchases WHERE user_id = ? AND course_id = ?')
                .get(req.user.id, course.id);
            course.purchased = !!purchase;
        }

        res.json({ course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du cours' });
    }
});

// Create course (owner only)
router.post('/', authenticateToken, isOwner, upload.single('file'), (req, res) => {
    try {
        const { title, description, category, is_free, price } = req.body;
        const file = req.file;

        if (!title || !category || !file) {
            return res.status(400).json({ error: 'Titre, catégorie et fichier requis' });
        }

        const isFree = is_free === 'true' || is_free === true;
        const coursePrice = isFree ? 0 : parseFloat(price) || 0;

        const result = db.prepare(`
      INSERT INTO courses (title, description, category, file_path, file_name, file_type, file_size, is_free, price, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            title,
            description || '',
            category,
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            isFree ? 1 : 0,
            coursePrice,
            req.user.id
        );

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: 'Cours créé avec succès', course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du cours' });
    }
});

// Update course (owner only)
router.put('/:id', authenticateToken, isOwner, upload.single('file'), (req, res) => {
    try {
        const { title, description, category, is_free, price } = req.body;
        const courseId = req.params.id;

        const existingCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!existingCourse) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        let filePath = existingCourse.file_path;
        let fileName = existingCourse.file_name;
        let fileType = existingCourse.file_type;
        let fileSize = existingCourse.file_size;

        if (req.file) {
            // Delete old file
            const oldFilePath = join(uploadsDir, existingCourse.file_path);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            filePath = req.file.filename;
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
            fileSize = req.file.size;
        }

        const isFree = is_free === 'true' || is_free === true;
        const coursePrice = isFree ? 0 : parseFloat(price) || existingCourse.price;

        db.prepare(`
      UPDATE courses 
      SET title = ?, description = ?, category = ?, file_path = ?, file_name = ?, file_type = ?, file_size = ?, is_free = ?, price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
            title || existingCourse.title,
            description !== undefined ? description : existingCourse.description,
            category || existingCourse.category,
            filePath,
            fileName,
            fileType,
            fileSize,
            isFree ? 1 : 0,
            coursePrice,
            courseId
        );

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        res.json({ message: 'Cours mis à jour', course });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du cours' });
    }
});

// Delete course (owner only)
router.delete('/:id', authenticateToken, isOwner, (req, res) => {
    try {
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        // Delete file
        const filePath = join(uploadsDir, course.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete related records
        db.prepare('DELETE FROM downloads WHERE course_id = ?').run(course.id);
        db.prepare('DELETE FROM purchases WHERE course_id = ?').run(course.id);
        db.prepare('DELETE FROM courses WHERE id = ?').run(course.id);

        res.json({ message: 'Cours supprimé avec succès' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du cours' });
    }
});

// Download course file (authenticated, must own or be free)
router.get('/:id/download', authenticateToken, (req, res) => {
    try {
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        // Check access
        const isOwner = req.user.role === 'owner';
        const isFree = course.is_free === 1;
        const hasPurchased = db.prepare('SELECT id FROM purchases WHERE user_id = ? AND course_id = ?')
            .get(req.user.id, course.id);

        if (!isOwner && !isFree && !hasPurchased) {
            return res.status(403).json({ error: 'Vous devez acheter ce cours pour le télécharger' });
        }

        // Record download
        db.prepare('INSERT INTO downloads (user_id, course_id) VALUES (?, ?)').run(req.user.id, course.id);

        const filePath = join(uploadsDir, course.file_path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        res.download(filePath, course.file_name);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
    }
});

// View course file (for PDF viewer)
router.get('/:id/view', authenticateToken, (req, res) => {
    try {
        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }

        // Check access
        const isOwner = req.user.role === 'owner';
        const isFree = course.is_free === 1;
        const hasPurchased = db.prepare('SELECT id FROM purchases WHERE user_id = ? AND course_id = ?')
            .get(req.user.id, course.id);

        if (!isOwner && !isFree && !hasPurchased) {
            return res.status(403).json({ error: 'Vous devez acheter ce cours pour le lire' });
        }

        const filePath = join(uploadsDir, course.file_path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        res.setHeader('Content-Type', course.file_type);
        res.setHeader('Content-Disposition', `inline; filename="${course.file_name}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error('View error:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture' });
    }
});

export default router;
