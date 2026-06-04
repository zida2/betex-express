/**
 * GPS Controller
 * Handles HTTP requests for GPS position tracking
 */

const gpsService = require('../services/gpsService');
const logger = require('../utils/logger');

/**
 * Submit GPS position
 */
const submitPosition = async (req, res, next) => {
  try {
    // Find driver by userId
    const { Driver } = require('../models');
    const driver = await Driver.findOne({ where: { userId: req.user.id } });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRIVER_NOT_FOUND',
          message: 'Driver profile not found for this user'
        }
      });
    }

    // Add driverId to the position data
    const positionData = {
      ...req.body,
      driverId: driver.id
    };

    const position = await gpsService.submitPosition(positionData);
    
    res.status(201).json({
      success: true,
      message: 'Position submitted successfully',
      data: position
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current positions of all drivers
 */
const getCurrentPositions = async (req, res, next) => {
  try {
    const positions = await gpsService.getCurrentPositions();
    
    res.status(200).json({
      success: true,
      data: positions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current position of a specific driver
 */
const getDriverCurrentPosition = async (req, res, next) => {
  try {
    const position = await gpsService.getDriverCurrentPosition(req.params.id);
    
    res.status(200).json({
      success: true,
      data: position
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get position history for a driver
 */
const getDriverPositionHistory = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await gpsService.getDriverPositionHistory(req.params.id, filters);
    
    res.status(200).json({
      success: true,
      data: result.positions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPosition,
  getCurrentPositions,
  getDriverCurrentPosition,
  getDriverPositionHistory
};
