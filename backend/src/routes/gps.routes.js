/**
 * GPS Routes
 * GPS position tracking endpoints
 */

const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gpsController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * POST /api/v1/gps/position
 * Submit driver GPS position
 */
router.post('/position', authMiddleware, gpsController.submitPosition);

/**
 * GET /api/v1/gps/drivers/current
 * Get current positions of all drivers
 */
router.get('/drivers/current', authMiddleware, gpsController.getCurrentPositions);

/**
 * GET /api/v1/gps/drivers/:id/current
 * Get current position of a specific driver
 */
router.get('/drivers/:id/current', authMiddleware, gpsController.getDriverCurrentPosition);

/**
 * GET /api/v1/gps/drivers/:id/history
 * Get position history for a driver
 */
router.get('/drivers/:id/history', authMiddleware, gpsController.getDriverPositionHistory);

module.exports = router;
