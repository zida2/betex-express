/**
 * Zones Routes
 * Zone management endpoints
 */

const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * GET /api/v1/zones
 * List all zones
 */
router.get('/', authMiddleware, zoneController.getZones);

/**
 * POST /api/v1/zones
 * Create a new zone
 */
router.post('/', authMiddleware, zoneController.createZone);

/**
 * GET /api/v1/zones/:id
 * Get zone details
 */
router.get('/:id', authMiddleware, zoneController.getZoneById);

/**
 * PUT /api/v1/zones/:id
 * Update zone
 */
router.put('/:id', authMiddleware, zoneController.updateZone);

/**
 * DELETE /api/v1/zones/:id
 * Delete zone
 */
router.delete('/:id', authMiddleware, zoneController.deleteZone);

module.exports = router;
