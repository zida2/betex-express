/**
 * Delivery Requests Routes
 * Endpoints for managing delivery requests
 */

const express = require('express');
const router = express.Router();
const deliveryRequestsController = require('../controllers/deliveryRequestsController');
const authMiddleware = require('../middleware/auth.middleware');

// Public endpoint - Client creates delivery request
router.post('/', deliveryRequestsController.create);

// Admin endpoints
router.use(authMiddleware.authenticate); // All below require authentication

// Get all delivery requests with optional filters
router.get('/', deliveryRequestsController.getAll);

// Get single delivery request
router.get('/:id', deliveryRequestsController.getById);

// Get available drivers for assignment
router.get('/available/drivers', deliveryRequestsController.getAvailableDrivers);

// Approve delivery request and assign driver
router.post('/:id/approve', deliveryRequestsController.approve);

// Reject delivery request
router.post('/:id/reject', deliveryRequestsController.reject);

// Send message to client
router.post('/:id/send-message', deliveryRequestsController.sendMessageToClient);

// Update delivery request status
router.patch('/:id/status', deliveryRequestsController.updateStatus);

module.exports = router;
