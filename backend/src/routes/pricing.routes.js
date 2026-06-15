/**
 * Pricing Routes
 * Handles pricing configuration
 */

const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */

// GET /api/v1/pricing
router.get('/', pricingController.getPricing);

// POST /api/v1/pricing/calculate-express (helper endpoint)
router.post('/calculate-express', pricingController.calculateExpressPrice);

/**
 * Admin Routes
 */

// PUT /api/v1/pricing (admin only)
router.put('/', authMiddleware, adminMiddleware, pricingController.updatePricing);

module.exports = router;
