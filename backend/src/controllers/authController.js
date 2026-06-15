/**
 * Authentication Controller
 * Handles user login, registration, token refresh, and logout
 */

const { User, Shipment, ScheduledDelivery } = require('../models');
const authService = require('../services/authService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * POST /auth/login
 * Login user with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!authService.validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordMatch = await authService.verifyPassword(password, user.passwordHash);

    if (!passwordMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Generate tokens
    const authResponse = authService.generateAuthResponse(user);

    logger.info(`User logged in: ${email}`);

    return res.status(200).json({
      success: true,
      data: authResponse
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * POST /auth/register
 * Register new user (client role)
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Validate email
    if (!authService.validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    const passwordValidation = authService.validatePasswordStrength(password, 'client');
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      phone: phone || null,
      role: 'client',
      isActive: true
    });

    logger.info(`New user registered: ${email} (${firstName} ${lastName})`);

    // Generate tokens
    const authResponse = authService.generateAuthResponse(user);

    return res.status(201).json({
      success: true,
      data: authResponse
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = authService.verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get user
    const user = await User.findByPk(decoded.sub);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = authService.generateAccessToken(
      user,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY || '15m'
    );

    logger.info(`Token refreshed for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: authService.parseExpiryTime(
          process.env.JWT_EXPIRY || '15m'
        )
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

/**
 * GET /auth/me
 * Get current authenticated user
 */
const getMe = async (req, res) => {
  try {
    // User ID is in req.user.sub (JWT standard)
    const userId = req.user.sub;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

/**
 * POST /auth/logout
 * Logout user (frontend should remove tokens)
 */
const logout = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (userId) {
      logger.info(`User logged out: ${userId}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

/**
 * GET /auth/users
 * List users (admin only, optional role filter)
 */
const listUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    
    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('List users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list users',
      error: error.message
    });
  }
};

/**
 * GET /auth/clients-with-activity
 * Get clients who have shipments or scheduled deliveries (admin only)
 */
const getClientsWithActivity = async (req, res) => {
  try {
    // Get all client IDs from shipments
    const shipmentClientIds = await Shipment.findAll({
      attributes: ['clientId'],
      group: ['clientId']
    }).then(shipments => shipments.map(s => s.clientId).filter(id => id));

    // Get all client IDs from scheduled deliveries
    const scheduledClientIds = await ScheduledDelivery.findAll({
      attributes: ['clientId'],
      group: ['clientId']
    }).then(scheduled => scheduled.map(s => s.clientId).filter(id => id));

    // Combine unique client IDs
    const uniqueClientIds = [...new Set([...shipmentClientIds, ...scheduledClientIds])];

    let clients = [];
    if (uniqueClientIds.length > 0) {
      // Fetch clients with those IDs
      clients = await User.findAll({
        where: {
          id: { [Op.in]: uniqueClientIds },
          role: 'client'
        },
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });
    }

    return res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    logger.error('Get clients with activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get clients with activity',
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  refresh,
  getMe,
  logout,
  listUsers,
  getClientsWithActivity
};
