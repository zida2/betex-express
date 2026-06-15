/**
 * Drivers Routes
 * Handles driver management
 */

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Protected Routes (require authentication)
 */

// GET /api/v1/drivers
router.get('/', authMiddleware, driverController.getDrivers);

// POST /api/v1/drivers (admin only - create new driver)
router.post('/', authMiddleware, adminMiddleware, driverController.createDriver);

// GET /api/v1/drivers/:id
router.get('/:id', authMiddleware, driverController.getDriverById);

// GET /api/v1/drivers/:id/stats (driver statistics)
router.get('/:id/stats', authMiddleware, driverController.getDriverStatistics);

// GET /api/v1/drivers/:id/statistics (comprehensive driver statistics)
router.get('/:id/statistics', authMiddleware, driverController.getDriverStatistics);

// PATCH /api/v1/drivers/:id/status (admin only - update status)
router.patch('/:id/status', authMiddleware, adminMiddleware, driverController.updateDriverStatus);

// PUT /api/v1/drivers/:id (admin only - update driver profile)
router.put('/:id', authMiddleware, adminMiddleware, driverController.updateDriver);

// DELETE /api/v1/drivers/:id (admin only - delete driver)
router.delete('/:id', authMiddleware, adminMiddleware, driverController.deleteDriver);

module.exports = router;
