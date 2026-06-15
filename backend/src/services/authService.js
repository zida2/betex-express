/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and password management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {promise<boolean>} True if password matches
 */
const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Generate JWT access token
 * @param {object} user - User object with id, email, role
 * @param {string} secret - JWT secret
 * @param {string} expiryTime - Token expiry time (e.g., '15m', '1h')
 * @returns {string} JWT token
 */
const generateAccessToken = (user, secret, expiryTime = '15m') => {
  try {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: expiryTime,
      issuer: 'betex-express',
      audience: 'betex-api'
    });

    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Generate JWT refresh token
 * @param {object} user - User object with id
 * @param {string} secret - JWT secret for refresh token
 * @param {string} expiryTime - Token expiry time (e.g., '7d')
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user, secret, expiryTime = '7d') => {
  try {
    const payload = {
      sub: user.id,
      type: 'refresh'
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: expiryTime,
      issuer: 'betex-express'
    });

    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {object} Decoded token payload
 */
const verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'betex-express'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Generate authentication response with tokens
 * @param {object} user - User object
 * @param {object} config - { jwtSecret, jwtExpiry, refreshSecret, refreshExpiry }
 * @returns {object} Authentication response
 */
const generateAuthResponse = (user, config = {}) => {
  const {
    jwtSecret = process.env.JWT_SECRET,
    jwtExpiry = process.env.JWT_EXPIRY || '15m',
    refreshSecret = process.env.REFRESH_TOKEN_SECRET,
    refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d'
  } = config;

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = generateAccessToken(user, jwtSecret, jwtExpiry);
  const refreshToken = generateRefreshToken(user, refreshSecret, refreshExpiry);

  // Parse expiry time to seconds
  const expiresInSeconds = parseExpiryTime(jwtExpiry);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      cnib: user.cnib || null
    },
    accessToken,
    refreshToken,
    expiresIn: expiresInSeconds,
    tokenType: 'Bearer'
  };
};

/**
 * Parse expiry time string to seconds
 * @param {string} timeStr - Time string (e.g., '15m', '1h', '7d')
 * @returns {number} Seconds
 */
const parseExpiryTime = (timeStr) => {
  const units = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];
  return value * (units[unit] || 1);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {string} role - User role for context-specific validation
 * @returns {object} { valid, errors[] }
 */
const validatePasswordStrength = (password, role = 'client') => {
  const errors = [];

  // Simpler validation for clients (self-registration)
  if (role === 'client') {
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Stricter validation for admin/driver accounts (created by admin)
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Create JWT token payload from user
 * @param {object} user - User object from database
 * @returns {object} Token payload
 */
const createTokenPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    permissions: getPermissionsForRole(user.role)
  };
};

/**
 * Get permissions based on user role
 * @param {string} role - User role
 * @returns {array} Array of permissions
 */
const getPermissionsForRole = (role) => {
  const permissions = {
    admin: [
      'read:all',
      'write:all',
      'delete:all',
      'approve:requests',
      'manage:users',
      'manage:pricing',
      'view:revenue'
    ],
    dispatcher: [
      'read:requests',
      'write:requests',
      'approve:requests',
      'assign:drivers'
    ],
    driver: [
      'read:own_requests',
      'write:gps',
      'read:own_stats'
    ],
    client: [
      'create:requests',
      'read:own_requests',
      'track:deliveries'
    ]
  };

  return permissions[role] || [];
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateAuthResponse,
  parseExpiryTime,
  validatePasswordStrength,
  validateEmail,
  createTokenPayload,
  getPermissionsForRole
};
