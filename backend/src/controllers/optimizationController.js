/**
 * Optimization Controller
 * Handles intelligent route and driver assignment
 */

const optimizationService = require('../services/optimizationService');
const logger = require('../utils/logger');

/**
 * Find nearest driver to a zone
 */
const findNearestDriver = async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const { excludeDriverIds } = req.body;

    const driver = await optimizationService.findNearestDriver(
      zoneId,
      excludeDriverIds || []
    );
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Optimize package assignment
 */
const optimizePackageAssignment = async (req, res, next) => {
  try {
    const { packageIds, zoneId } = req.body;

    const assignments = await optimizationService.optimizePackageAssignment(
      packageIds,
      zoneId
    );
    
    logger.info(`Optimized assignment for ${assignments.length} packages`);
    
    res.status(200).json({
      success: true,
      message: 'Packages optimized and assigned',
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver workload
 */
const getDriverWorkload = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const workload = await optimizationService.getDriverWorkload(driverId);
    
    res.status(200).json({
      success: true,
      data: workload
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drivers workload
 */
const getAllDriversWorkload = async (req, res, next) => {
  try {
    const workloads = await optimizationService.getAllDriversWorkload();
    
    res.status(200).json({
      success: true,
      data: workloads
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suggest best driver for a package
 */
const suggestBestDriver = async (req, res, next) => {
  try {
    const { packageId } = req.params;

    const suggestion = await optimizationService.suggestBestDriver(packageId);
    
    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suggest driver based on location coordinates
 */
const suggestDriverByLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const suggestion = await optimizationService.suggestDriverByLocation(
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findNearestDriver,
  optimizePackageAssignment,
  getDriverWorkload,
  getAllDriversWorkload,
  suggestBestDriver,
  suggestDriverByLocation
};
