/**
 * Expense Routes
 * Routes for expense management (driver and admin)
 */

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * POST /api/v1/expenses
 * Submit expense
 * Access: Driver (driver expenses), Admin (admin expenses)
 */
router.post('/', expenseController.submitExpense);

/**
 * GET /api/v1/expenses
 * Get expenses
 * Access: Driver (own expenses), Admin (all expenses)
 */
router.get('/', expenseController.getExpenses);

/**
 * GET /api/v1/expenses/summary
 * Get expense summary
 * Access: Admin
 */
router.get('/summary', requireRole(['admin']), expenseController.getExpenseSummary);

/**
 * GET /api/v1/expenses/:id
 * Get expense by ID
 * Access: Driver (own expense), Admin (any expense)
 */
router.get('/:id', expenseController.getExpense);

/**
 * PUT /api/v1/expenses/:id/approve
 * Approve expense
 * Access: Admin
 */
router.put('/:id/approve', requireRole(['admin']), expenseController.approveExpense);

/**
 * PUT /api/v1/expenses/:id/reject
 * Reject expense
 * Access: Admin
 */
router.put('/:id/reject', requireRole(['admin']), expenseController.rejectExpense);

/**
 * GET /api/v1/expenses/drivers/fuel
 * Get driver fuel expenses by date
 * Access: Admin, Driver
 */
router.get('/drivers/fuel', expenseController.getDriverFuelExpenses);

/**
 * POST /api/v1/expenses/drivers/fuel
 * Set driver fuel expense for a specific day
 * Access: Admin
 */
router.post('/drivers/fuel', requireRole(['admin']), expenseController.setDriverFuelExpense);

module.exports = router;
