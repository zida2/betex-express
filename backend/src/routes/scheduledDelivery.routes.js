/**
 * Scheduled Delivery Routes
 * Routes for scheduled delivery management
 */

const express = require('express');
const router = express.Router();
const scheduledDeliveryController = require('../controllers/scheduledDeliveryController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * POST /api/v1/scheduled-deliveries
 * Create scheduled delivery
 * Access: Client, Admin
 */
router.post('/', requireRole(['client', 'admin']), scheduledDeliveryController.createScheduledDelivery);

/**
 * GET /api/v1/scheduled-deliveries
 * Get scheduled deliveries
 * Access: Client (own), Admin (all)
 */
router.get('/', scheduledDeliveryController.getScheduledDeliveries);

/**
 * GET /api/v1/scheduled-deliveries/:id
 * Get scheduled delivery by ID
 * Access: Client (own), Admin (all)
 */
router.get('/:id', scheduledDeliveryController.getScheduledDelivery);

/**
 * PUT /api/v1/scheduled-deliveries/:id
 * Update scheduled delivery
 * Access: Client (own, pending only), Admin (all)
 */
router.put('/:id', scheduledDeliveryController.updateScheduledDelivery);

/**
 * PUT /api/v1/scheduled-deliveries/:id/approve
 * Approve scheduled delivery
 * Access: Admin
 */
router.put('/:id/approve', requireRole(['admin']), scheduledDeliveryController.approveScheduledDelivery);

/**
 * PUT /api/v1/scheduled-deliveries/:id/assign
 * Assign driver to scheduled delivery
 * Access: Admin
 */
router.put('/:id/assign', requireRole(['admin']), scheduledDeliveryController.assignDriver);

/**
 * PUT /api/v1/scheduled-deliveries/:id/status
 * Update delivery status
 * Access: Admin, Driver (assigned)
 */
router.put('/:id/status', requireRole(['admin', 'driver']), scheduledDeliveryController.updateStatus);

/**
 * PUT /api/v1/scheduled-deliveries/:id/cancel
 * Cancel scheduled delivery
 * Access: Client (own), Admin (all)
 */
router.put('/:id/cancel', scheduledDeliveryController.cancelScheduledDelivery);

module.exports = router;
