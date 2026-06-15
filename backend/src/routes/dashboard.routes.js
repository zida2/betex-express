/**
 * Dashboard Routes
 * Handles dashboard overview and statistics
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Admin Routes
 */

// GET /api/v1/dashboard/overview (admin only)
router.get('/overview', authMiddleware, adminMiddleware, dashboardController.getOverview);

module.exports = router;
