/**
 * GPS Routes
 * Handles real-time GPS tracking
 */

const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gpsController');
const { authMiddleware, adminMiddleware, driverMiddleware } = require('../middleware/auth.middleware');

/**
 * Driver Routes
 */

// POST /api/v1/gps/update (driver only)
router.post('/update', authMiddleware, driverMiddleware, gpsController.updateGPSPosition);

/**
 * Admin Routes
 */

// GET /api/v1/gps/drivers/current (admin only)
router.get('/drivers/current', authMiddleware, adminMiddleware, gpsController.getCurrentDriverLocations);

// GET /api/v1/gps/driver/:driverId/history (admin or driver own data)
router.get('/driver/:driverId/history', authMiddleware, gpsController.getDriverGPSHistory);

module.exports = router;
