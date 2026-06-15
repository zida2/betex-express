/**
 * Stock Routes
 * Inventory management endpoints
 */

const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authMiddleware } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/stock/products
 * Get all products
 */
router.get('/products', stockController.getAllProducts);

/**
 * GET /api/v1/stock/alerts/low
 * Get low stock alerts
 */
router.get('/alerts/low', stockController.getLowStockAlerts);

/**
 * GET /api/v1/stock/zone/:zoneId
 * Get all stocks for a zone
 */
router.get('/zone/:zoneId', stockController.getStocksByZone);

/**
 * POST /api/v1/stock
 * Create stock entry
 */
router.post('/', stockController.createStock);

/**
 * GET /api/v1/stock/:stockId/history
 * Get stock movement history
 */
router.get('/:stockId/history', stockController.getStockMovementHistory);

/**
 * GET /api/v1/stock/:productId/:zoneId
 * Get stock for a product in a zone
 */
router.get('/:productId/:zoneId', stockController.getStock);

/**
 * PUT /api/v1/stock/:stockId
 * Update stock quantity
 */
router.put('/:stockId', stockController.updateStockQuantity);

module.exports = router;
