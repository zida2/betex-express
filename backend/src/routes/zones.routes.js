/**
 * Zones Routes
 * Handles zone management
 */

const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */

// GET /api/v1/zones
router.get('/', zoneController.getZones);

/**
 * Admin Routes
 */

// POST /api/v1/zones (admin only)
router.post('/', authMiddleware, adminMiddleware, zoneController.createZone);

// PUT /api/v1/zones/:id (admin only)
router.put('/:id', authMiddleware, adminMiddleware, zoneController.updateZone);

// DELETE /api/v1/zones/:id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, zoneController.deleteZone);

module.exports = router;
