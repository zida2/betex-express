/**
 * Driver Statistics Routes
 * Routes for driver performance and statistics endpoints
 */

const express = require('express');
const router = express.Router();
const driverStatsController = require('../controllers/driverStatsController');
const { authMiddleware } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /drivers/:driverId/statistics
 * Get driver performance statistics
 */
router.get(
  '/:driverId/statistics',
  driverStatsController.getDriverStats
);

/**
 * GET /drivers/:driverId/history
 * Get driver delivery history
 * Query params: status, fromDate, toDate
 */
router.get(
  '/:driverId/history',
  driverStatsController.getDeliveryHistory
);

/**
 * GET /optimization/workload
 * Get all drivers workload status
 */
router.get(
  '/workload',
  driverStatsController.getDriversWorkload
);

/**
 * GET /packages/:packageId/tracking
 * Get package tracking info for driver
 * Query params: driverId
 */
router.get(
  '/packages/:packageId/tracking',
  driverStatsController.getPackageTracking
);

/**
 * PATCH /packages/:packageId/status
 * Update package delivery status
 * Body: { status, notes?, rating? }
 */
router.patch(
  '/packages/:packageId/status',
  driverStatsController.updatePackageStatus
);

/**
 * GET /drivers/map/data
 * Get driver map data (position and active packages)
 */
router.get(
  '/map/data',
  driverStatsController.getDriverMapData
);

module.exports = router;
