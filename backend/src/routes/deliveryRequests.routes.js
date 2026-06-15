/**
 * Delivery Requests Routes
 * Handles all delivery request operations
 */

const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryRequestsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

/**
 * Public Routes (client can create delivery requests)
 */

// POST /api/v1/delivery-requests
router.post('/', authMiddleware, deliveryController.createDeliveryRequest);

// GET /api/v1/delivery-requests (list all - clients can see their own, admins see all)
router.get('/', authMiddleware, deliveryController.getDeliveryRequests);

// GET /api/v1/delivery-requests/:id (get single)
router.get('/:id', authMiddleware, deliveryController.getDeliveryRequest);

/**
 * Admin Routes
 */

// POST /api/v1/delivery-requests/:id/approve
router.post('/:id/approve', authMiddleware, adminMiddleware, deliveryController.approveDeliveryRequest);

// POST /api/v1/delivery-requests/:id/reject
router.post('/:id/reject', authMiddleware, adminMiddleware, deliveryController.rejectDeliveryRequest);

// POST /api/v1/delivery-requests/:id/location-token (save location token)
router.post('/:id/location-token', authMiddleware, adminMiddleware, deliveryController.saveLocationToken);

// GET /api/v1/delivery-requests/location/:token (verify token and get delivery info)
router.get('/location/:token', deliveryController.getDeliveryByToken);

// POST /api/v1/delivery-requests/location/:token (save receiver location)
router.post('/location/:token', deliveryController.saveReceiverLocation);

module.exports = router;
