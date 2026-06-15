/**
 * Client Stock Routes
 * Routes for client-based inventory management
 */

const express = require('express');
const router = express.Router();
const clientStockController = require('../controllers/clientStockController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/v1/client-stock
 * Get client's stock inventory
 * Access: Client (own stock), Admin (any client)
 */
router.get('/', clientStockController.getClientStock);

/**
 * POST /api/v1/client-stock
 * Add product to client stock
 * Access: Admin only
 */
router.post('/', requireRole(['admin']), clientStockController.addProductToStock);

/**
 * PUT /api/v1/client-stock/:id
 * Update stock quantity
 * Access: Admin only
 */
router.put('/:id', requireRole(['admin']), clientStockController.updateStockQuantity);

/**
 * GET /api/v1/client-stock/movements
 * Get stock movement history
 * Access: Client (own movements), Admin (any client)
 */
router.get('/movements', clientStockController.getStockMovements);

/**
 * GET /api/v1/client-stock/history/:clientId
 * Get stock movement history by client ID
 * Access: Admin only
 */
router.get('/history/:clientId', requireRole(['admin']), clientStockController.getClientMovementHistory);

/**
 * POST /api/v1/client-stock/movement
 * Record stock movement
 * Access: Admin only
 */
router.post('/movement', requireRole(['admin']), clientStockController.recordStockMovement);

/**
 * PUT /api/v1/client-stock/:id/movement
 * Record stock movement (alternative endpoint with stock ID in URL)
 * Access: Admin only
 */
router.put('/:id/movement', requireRole(['admin']), clientStockController.recordStockMovementById);

module.exports = router;
