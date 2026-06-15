/**
 * GPS Controller
 * Handles real-time GPS tracking for drivers
 */

const { GPSPosition, Driver, User } = require('../models');
const logger = require('../utils/logger');

/**
 * POST /gps/update
 * Update driver GPS position (driver only)
 */
const updateGPSPosition = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, heading, altitude } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate coordinates
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Get driver
    const driver = await Driver.findOne({
      where: { userId: userId }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Create GPS position record
    const position = await GPSPosition.create({
      driverId: driver.id,
      latitude,
      longitude,
      accuracy: accuracy || null,
      speed: speed || null,
      heading: heading || null,
      altitude: altitude || null,
      timestamp: new Date()
    });

    // Update driver's current location
    await driver.update({
      currentLat: latitude,
      currentLng: longitude,
      lastLocationUpdate: new Date()
    });

    logger.info(`GPS updated for driver ${driver.id}: (${latitude}, ${longitude})`);

    return res.status(200).json({
      success: true,
      message: 'Position updated successfully',
      data: {
        position: {
          latitude,
          longitude,
          accuracy,
          recordedAt: position.timestamp
        }
      }
    });
  } catch (error) {
    logger.error('Update GPS position error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update position',
      error: error.message
    });
  }
};

/**
 * GET /gps/drivers/current
 * Get current location of all active drivers (admin only)
 */
const getCurrentDriverLocations = async (req, res) => {
  try {
    const { onlineOnly } = req.query;

    let where = { status: 'active' };

    if (onlineOnly === 'true') {
      // Check if last update is within last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      where.lastLocationUpdate = {
        [require('sequelize').Op.gte]: fiveMinutesAgo
      };
    }

    const drivers = await Driver.findAll({
      where,
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'email'] }
      ],
      attributes: [
        'id',
        'currentLat',
        'currentLng',
        'lastLocationUpdate',
        'completedToday',
        'assignedPackages'
      ]
    });

    const formattedDrivers = drivers.map(driver => ({
      driverId: driver.id,
      driverName: `${driver.User?.firstName || ''} ${driver.User?.lastName || ''}`,
      name: `${driver.User?.firstName || ''} ${driver.User?.lastName || ''}`,
      email: driver.User?.email,
      latitude: driver.currentLat,
      longitude: driver.currentLng,
      lastUpdate: driver.lastLocationUpdate,
      completedToday: driver.completedToday,
      assignedPackages: driver.assignedPackages,
      isOnline:
        driver.lastLocationUpdate &&
        new Date(driver.lastLocationUpdate) >
          new Date(Date.now() - 5 * 60 * 1000)
    }));

    logger.info(`Retrieved locations for ${formattedDrivers.length} drivers`);

    return res.status(200).json({
      success: true,
      data: {
        drivers: formattedDrivers,
        count: formattedDrivers.length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Get current driver locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get driver locations',
      error: error.message
    });
  }
};

/**
 * GET /gps/driver/:driverId/history
 * Get GPS history for a specific driver (admin or driver own data)
 */
const getDriverGPSHistory = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    // Authorization: allow driver to see own data, admin to see all
    const requestingUserId = req.user.id;
    const driver = await Driver.findOne({
      where: { userId: driverId }
    });

    if (
      !driver ||
      (req.user.role !== 'admin' && req.user.role !== 'dispatcher')
    ) {
      if (driver?.userId !== requestingUserId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this data'
        });
      }
    }

    let where = { driverId: driverId };

    // Add date filtering if provided
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        where.timestamp[require('sequelize').Op.gte] = new Date(startDate);
      }

      if (endDate) {
        where.timestamp[require('sequelize').Op.lte] = new Date(endDate);
      }
    }

    const positions = await GPSPosition.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    logger.info(
      `Retrieved ${positions.length} GPS positions for driver ${driverId}`
    );

    return res.status(200).json({
      success: true,
      data: {
        driverId,
        positions: positions.map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          altitude: p.altitude,
          recordedAt: p.timestamp
        })),
        total: positions.length,
        startDate: startDate || 'N/A',
        endDate: endDate || 'N/A'
      }
    });
  } catch (error) {
    logger.error('Get driver GPS history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get GPS history',
      error: error.message
    });
  }
};

module.exports = {
  updateGPSPosition,
  getCurrentDriverLocations,
  getDriverGPSHistory
};
