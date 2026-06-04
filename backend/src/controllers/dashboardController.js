/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard statistics
 */

const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

/**
 * Get dashboard overview statistics
 */
const getOverview = async (req, res, next) => {
  try {
    const overview = await dashboardService.getOverview();
    
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver statistics
 */
const getDriverStatistics = async (req, res, next) => {
  try {
    const statistics = await dashboardService.getDriverStatistics();
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed statistics
 */
const getDetailedStatistics = async (req, res, next) => {
  try {
    const overview = await dashboardService.getOverview();
    const driverStats = await dashboardService.getDriverStatistics();
    
    res.status(200).json({
      success: true,
      data: {
        overview,
        drivers: driverStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real-time dashboard data
 */
const getRealtimeData = async (req, res, next) => {
  try {
    const overview = await dashboardService.getOverview();
    
    res.status(200).json({
      success: true,
      data: overview,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getDriverStatistics,
  getDetailedStatistics,
  getRealtimeData
};
