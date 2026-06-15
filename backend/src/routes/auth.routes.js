/**
 * Authentication Routes
 * User login, registration, token management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/register
router.post('/register', authController.register);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

/**
 * Protected Routes (require authentication)
 */

// GET /api/v1/auth/me
router.get('/me', authMiddleware, authController.getMe);

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, authController.logout);

// GET /api/v1/auth/users
router.get('/users', authMiddleware, authController.listUsers);

// GET /api/v1/auth/clients-with-activity
router.get('/clients-with-activity', authMiddleware, authController.getClientsWithActivity);

module.exports = router;
