/**
 * Validation Middleware
 * Request validation for API endpoints
 */

const { AppError } = require('./errorHandler.middleware');

/**
 * Validate package creation/update
 */
const validatePackage = (req, res, next) => {
  const { customerName, customerPhone, address, zoneId } = req.body;

  if (!customerName || customerName.trim().length === 0) {
    return next(new AppError('Customer name is required', 400, 'VALIDATION_ERROR'));
  }

  if (!customerPhone || customerPhone.trim().length === 0) {
    return next(new AppError('Customer phone is required', 400, 'VALIDATION_ERROR'));
  }

  if (!address || address.trim().length === 0) {
    return next(new AppError('Address is required', 400, 'VALIDATION_ERROR'));
  }

  if (!zoneId) {
    return next(new AppError('Zone ID is required', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate package status update
 */
const validatePackageStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'collected', 'in_delivery', 'delivered', 'delivery_failed', 'cancelled'];

  if (!status) {
    return next(new AppError('Status is required', 400, 'VALIDATION_ERROR'));
  }

  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate driver creation/update
 */
const validateDriver = (req, res, next) => {
  const { name, phone, email } = req.body;

  if (!name || name.trim().length === 0) {
    return next(new AppError('Driver name is required', 400, 'VALIDATION_ERROR'));
  }

  if (!phone || phone.trim().length === 0) {
    return next(new AppError('Driver phone is required', 400, 'VALIDATION_ERROR'));
  }

  if (email && !isValidEmail(email)) {
    return next(new AppError('Invalid email format', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate driver status update
 */
const validateDriverStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['offline', 'online', 'in_delivery', 'on_break'];

  if (!status) {
    return next(new AppError('Status is required', 400, 'VALIDATION_ERROR'));
  }

  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate route creation
 */
const validateRoute = (req, res, next) => {
  const { driverId, phase } = req.body;
  const validPhases = ['morning', 'afternoon', 'evening'];

  if (!driverId) {
    return next(new AppError('Driver ID is required', 400, 'VALIDATION_ERROR'));
  }

  if (!phase) {
    return next(new AppError('Phase is required', 400, 'VALIDATION_ERROR'));
  }

  if (!validPhases.includes(phase)) {
    return next(new AppError(`Invalid phase. Must be one of: ${validPhases.join(', ')}`, 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate route status update
 */
const validateRouteStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

  if (!status) {
    return next(new AppError('Status is required', 400, 'VALIDATION_ERROR'));
  }

  if (!validStatuses.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate zone creation/update
 */
const validateZone = (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    return next(new AppError('Zone name is required', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate GPS position submission
 */
const validateGPSPosition = (req, res, next) => {
  const { driverId, latitude, longitude } = req.body;

  if (!driverId) {
    return next(new AppError('Driver ID is required', 400, 'VALIDATION_ERROR'));
  }

  if (latitude === undefined || latitude === null) {
    return next(new AppError('Latitude is required', 400, 'VALIDATION_ERROR'));
  }

  if (longitude === undefined || longitude === null) {
    return next(new AppError('Longitude is required', 400, 'VALIDATION_ERROR'));
  }

  if (latitude < -90 || latitude > 90) {
    return next(new AppError('Latitude must be between -90 and 90', 400, 'VALIDATION_ERROR'));
  }

  if (longitude < -180 || longitude > 180) {
    return next(new AppError('Longitude must be between -180 and 180', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate user registration
 */
const validateRegistration = (req, res, next) => {
  const { username, email, password, role } = req.body;

  if (!username || username.trim().length === 0) {
    return next(new AppError('Username is required', 400, 'VALIDATION_ERROR'));
  }

  if (username.length < 3) {
    return next(new AppError('Username must be at least 3 characters', 400, 'VALIDATION_ERROR'));
  }

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Valid email is required', 400, 'VALIDATION_ERROR'));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400, 'VALIDATION_ERROR'));
  }

  if (role && !['admin', 'dispatcher', 'driver'].includes(role)) {
    return next(new AppError('Invalid role. Must be admin, dispatcher, or driver', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate user login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Valid email is required', 400, 'VALIDATION_ERROR'));
  }

  if (!password) {
    return next(new AppError('Password is required', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Validate password change
 */
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return next(new AppError('Current password is required', 400, 'VALIDATION_ERROR'));
  }

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400, 'VALIDATION_ERROR'));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from current password', 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Helper function to validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validatePackage,
  validatePackageStatus,
  validateDriver,
  validateDriverStatus,
  validateRoute,
  validateRouteStatus,
  validateZone,
  validateGPSPosition,
  validateRegistration,
  validateLogin,
  validatePasswordChange
};
