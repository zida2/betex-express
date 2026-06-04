/**
 * Authentication Routes
 * User registration, login, and token management
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /api/v1/auth/login
 * User login
 */
router.post('/login', authController.login);

/**
 * POST /api/v1/auth/logout
 * User logout
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, authController.getProfile);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * POST /api/v1/auth/change-password
 * Change password
 */
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
