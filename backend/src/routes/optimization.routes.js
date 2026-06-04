/**
 * Optimization Routes
 * Intelligent route and driver assignment endpoints
 */

const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimizationController');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/optimization/workload
 * Get all drivers workload
 */
router.get('/workload', optimizationController.getAllDriversWorkload);

/**
 * POST /api/v1/optimization/assign-packages
 * Optimize package assignment
 */
router.post('/assign-packages', optimizationController.optimizePackageAssignment);

/**
 * GET /api/v1/optimization/nearest-driver/:zoneId
 * Find nearest driver to a zone
 */
router.get('/nearest-driver/:zoneId', optimizationController.findNearestDriver);

/**
 * GET /api/v1/optimization/workload/:driverId
 * Get driver workload
 */
router.get('/workload/:driverId', optimizationController.getDriverWorkload);

/**
 * GET /api/v1/optimization/suggest-driver/:packageId
 * Suggest best driver for a package
 */
router.get('/suggest-driver/:packageId', optimizationController.suggestBestDriver);

/**
 * POST /api/v1/optimization/suggest-driver
 * Suggest best driver based on location coordinates
 */
router.post('/suggest-driver', optimizationController.suggestDriverByLocation);

module.exports = router;
