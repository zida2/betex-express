/**
 * Revenue Routes
 * Handles revenue and profit reporting
 */

const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Admin Routes
 */

// GET /api/v1/revenue/daily
router.get('/daily', authMiddleware, adminMiddleware, revenueController.getDailyRevenue);

// GET /api/v1/revenue/monthly
router.get('/monthly', authMiddleware, adminMiddleware, revenueController.getMonthlyRevenue);

module.exports = router;
