/**
 * Packages Routes
 * Package management endpoints
 */

const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * GET /api/v1/packages
 * List all packages with filtering
 */
router.get('/', authMiddleware, packageController.getPackages);

/**
 * POST /api/v1/packages
 * Create a new package
 */
router.post('/', authMiddleware, packageController.createPackage);

/**
 * GET /api/v1/packages/:id
 * Get package details
 */
router.get('/:id', authMiddleware, packageController.getPackageById);

/**
 * PUT /api/v1/packages/:id
 * Update package
 */
router.put('/:id', authMiddleware, packageController.updatePackage);

/**
 * DELETE /api/v1/packages/:id
 * Delete package
 */
router.delete('/:id', authMiddleware, packageController.deletePackage);

/**
 * PATCH /api/v1/packages/:id/status
 * Update package status
 */
router.patch('/:id/status', authMiddleware, packageController.updatePackageStatus);

/**
 * GET /api/v1/packages/:id/history
 * Get package delivery history
 */
router.get('/:id/history', authMiddleware, packageController.getPackageHistory);

module.exports = router;
