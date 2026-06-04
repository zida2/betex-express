/**
 * Authentication Service
 * Business logic for user authentication
 */

const bcrypt = require('bcryptjs');
const { User, Driver } = require('../models');
const { generateTokenPair } = require('../utils/jwt.utils');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Register a new user
 */
const register = async (userData) => {
  const { email, password, role, firstName, lastName, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    role: role || 'driver',
    firstName,
    lastName,
    phone,
    isActive: true
  });

  // If driver role, create driver profile
  if (user.role === 'driver') {
    await Driver.create({
      userId: user.id,
      name: `${firstName} ${lastName}`,
      phone: phone || '',
      email: email,
      status: 'offline'
    });
  }

  // Generate tokens
  const tokens = generateTokenPair(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    ...tokens
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is inactive', 401, 'ACCOUNT_INACTIVE');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  // Generate tokens
  const tokens = generateTokenPair(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    ...tokens
  };
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] }
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Update allowed fields
  const allowedFields = ['firstName', 'lastName', 'phone'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  await user.update(updateData);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone
  };
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid old password', 400, 'INVALID_PASSWORD');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await user.update({ passwordHash });

  return { message: 'Password changed successfully' };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
