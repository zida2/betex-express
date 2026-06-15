/**
 * Shipment Routes
 * Routes for shipment management
 */

const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * POST /api/v1/shipments
 * Create shipment request
 * Access: Client
 */
router.post('/', authMiddleware, requireRole(['client', 'admin']), shipmentController.createShipment);

/**
 * GET /api/v1/shipments
 * Get shipments
 * Access: Client (own shipments), Admin (all shipments)
 */
router.get('/', authMiddleware, shipmentController.getShipments);

/**
 * GET /api/v1/shipments/:trackingNumber
 * Track shipment (public endpoint)
 * Access: Anyone with tracking number
 */
router.get('/:trackingNumber', shipmentController.trackShipment);

/**
 * PUT /api/v1/shipments/:id/price
 * Set shipment pricing
 * Access: Admin
 */
router.put('/:id/price', authMiddleware, requireRole(['admin']), shipmentController.priceShipment);

/**
 * PUT /api/v1/shipments/:id/pay
 * Mark shipment as paid
 * Access: Client (own shipment), Admin
 */
router.put('/:id/pay', authMiddleware, shipmentController.payShipment);

/**
 * PUT /api/v1/shipments/:id/status
 * Update shipment status
 * Access: Admin
 */
router.put('/:id/status', authMiddleware, requireRole(['admin']), shipmentController.updateShipmentStatus);

/**
 * PUT /api/v1/shipments/:id/cancel
 * Cancel shipment
 * Access: Client (own shipment), Admin
 */
router.put('/:id/cancel', authMiddleware, shipmentController.cancelShipment);

module.exports = router;
