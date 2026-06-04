/**
 * Drivers Routes
 * Driver management endpoints
 */

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * GET /api/v1/drivers
 * List all drivers
 */
router.get('/', authMiddleware, driverController.getDrivers);

/**
 * POST /api/v1/drivers
 * Create a new driver
 */
router.post('/', authMiddleware, driverController.createDriver);

/**
 * GET /api/v1/drivers/:id
 * Get driver details
 */
router.get('/:id', authMiddleware, driverController.getDriverById);

/**
 * PUT /api/v1/drivers/:id
 * Update driver
 */
router.put('/:id', authMiddleware, driverController.updateDriver);

/**
 * DELETE /api/v1/drivers/:id
 * Delete driver
 */
router.delete('/:id', authMiddleware, driverController.deleteDriver);

/**
 * PATCH /api/v1/drivers/:id/status
 * Update driver status
 */
router.patch('/:id/status', authMiddleware, driverController.updateDriverStatus);

/**
 * GET /api/v1/drivers/:id/statistics
 * Get driver statistics
 */
router.get('/:id/statistics', authMiddleware, driverController.getDriverStatistics);

module.exports = router;
