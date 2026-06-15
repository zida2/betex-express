/**
 * Financial Routes
 * Routes for financial analytics and reporting
 */

const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/v1/financial/dashboard
 * Get financial dashboard data
 * Access: Admin
 */
router.get('/dashboard', requireRole(['admin']), financialController.getDashboard);

/**
 * GET /api/v1/financial/revenue
 * Get revenue breakdown
 * Access: Admin
 */
router.get('/revenue', requireRole(['admin']), financialController.getRevenue);

/**
 * GET /api/v1/financial/expenses
 * Get expenses breakdown
 * Access: Admin
 */
router.get('/expenses', requireRole(['admin']), financialController.getExpenses);

/**
 * GET /api/v1/financial/profit
 * Get profit analysis
 * Access: Admin
 */
router.get('/profit', requireRole(['admin']), financialController.getProfit);

/**
 * POST /api/v1/financial/report
 * Generate financial report
 * Access: Admin
 */
router.post('/report', requireRole(['admin']), financialController.generateReport);

module.exports = router;
