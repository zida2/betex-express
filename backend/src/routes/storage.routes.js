/**
 * Storage Service Routes
 * Routes for client storage service management
 */

const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * POST /api/v1/storage/request
 * Request storage service
 * Access: Client
 */
router.post('/request', requireRole(['client']), storageController.requestStorage);

/**
 * GET /api/v1/storage/requests
 * Get all storage requests
 * Access: Admin
 */
router.get('/requests', requireRole(['admin']), storageController.getStorageRequests);

/**
 * GET /api/v1/storage/my-storage
 * Get client's own storage service status
 * Access: Client
 */
router.get('/my-storage', requireRole(['client']), storageController.getMyStorage);

/**
 * PUT /api/v1/storage/requests/:id/approve
 * Approve storage request
 * Access: Admin
 */
router.put('/requests/:id/approve', requireRole(['admin']), storageController.approveStorageRequest);

/**
 * PUT /api/v1/storage/requests/:id/reject
 * Reject storage request
 * Access: Admin
 */
router.put('/requests/:id/reject', requireRole(['admin']), storageController.rejectStorageRequest);

/**
 * PUT /api/v1/storage/requests/:id/suspend
 * Suspend storage service
 * Access: Admin
 */
router.put('/requests/:id/suspend', requireRole(['admin']), storageController.suspendStorage);

/**
 * PUT /api/v1/storage/requests/:id/reactivate
 * Reactivate storage service
 * Access: Admin
 */
router.put('/requests/:id/reactivate', requireRole(['admin']), storageController.reactivateStorage);

module.exports = router;
