/**
 * Announcement Routes
 * Handles announcement management
 */

const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * Client Routes
 */
// GET /api/v1/announcements/active - Get active announcements
router.get('/active', authMiddleware, announcementController.getActiveAnnouncements);

/**
 * Admin Routes
 */
// GET /api/v1/announcements - Get all announcements
router.get('/', authMiddleware, adminMiddleware, announcementController.getAllAnnouncements);

// POST /api/v1/announcements - Create announcement
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), announcementController.createAnnouncement);

// PUT /api/v1/announcements/:id - Update announcement
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), announcementController.updateAnnouncement);

// DELETE /api/v1/announcements/:id - Delete announcement
router.delete('/:id', authMiddleware, adminMiddleware, announcementController.deleteAnnouncement);

module.exports = router;
