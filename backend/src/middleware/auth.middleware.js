/**
 * Authentication Middleware
 * Validates JWT tokens and checks user permissions
 */

const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Verify JWT token from Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = authService.verifyToken(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn(`Invalid token: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Check if user is admin
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'dispatcher') {
      logger.warn(`Unauthorized access attempt by user: ${req.user.sub}`);
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Check if user is driver
 */
const driverMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (req.user.role !== 'driver') {
      logger.warn(`Unauthorized access attempt by user: ${req.user.sub}`);
      return res.status(403).json({
        success: false,
        message: 'Driver access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Driver middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Check if user is client
 */
const clientMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (req.user.role !== 'client') {
      logger.warn(`Unauthorized access attempt by user: ${req.user.sub}`);
      return res.status(403).json({
        success: false,
        message: 'Client access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Client middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Check if user has one of the required roles
 * @param {Array<string>} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user: ${req.user.sub}, role: ${req.user.role}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  driverMiddleware,
  clientMiddleware,
  requireRole
};
