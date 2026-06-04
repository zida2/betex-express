/**
 * Error Handler Middleware
 * Global error handling for all routes
 */

const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date();
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log error
  logger.error({
    message: err.message,
    statusCode,
    errorCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message,
      details: err.details || null,
      timestamp: err.timestamp || new Date()
    }
  });
};

module.exports = {
  errorHandler,
  AppError
};
