/**
 * Routes Routes
 * Delivery route management endpoints
 */

const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * GET /api/v1/routes
 * List all routes
 */
router.get('/', authMiddleware, routeController.getRoutes);

/**
 * POST /api/v1/routes
 * Create a new route
 */
router.post('/', authMiddleware, routeController.createRoute);

/**
 * GET /api/v1/routes/:id
 * Get route details
 */
router.get('/:id', authMiddleware, routeController.getRouteById);

/**
 * DELETE /api/v1/routes/:id
 * Delete route
 */
router.delete('/:id', authMiddleware, routeController.deleteRoute);

/**
 * PATCH /api/v1/routes/:id/status
 * Update route status
 */
router.patch('/:id/status', authMiddleware, routeController.updateRouteStatus);

module.exports = router;
