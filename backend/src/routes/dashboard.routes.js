/**
 * Dashboard Routes
 * Dashboard statistics and metrics endpoints
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * GET /api/v1/dashboard/overview
 * Get dashboard overview statistics
 */
router.get('/overview', authMiddleware, dashboardController.getOverview);

/**
 * GET /api/v1/dashboard/drivers
 * Get driver statistics
 */
router.get('/drivers', authMiddleware, dashboardController.getDriverStatistics);

/**
 * GET /api/v1/dashboard/statistics
 * Get detailed statistics
 */
router.get('/statistics', authMiddleware, dashboardController.getDetailedStatistics);

/**
 * GET /api/v1/dashboard/realtime
 * Get real-time dashboard data
 */
router.get('/realtime', authMiddleware, dashboardController.getRealtimeData);

module.exports = router;
