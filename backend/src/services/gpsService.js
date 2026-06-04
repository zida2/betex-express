/**
 * GPS Service
 * Business logic for GPS position tracking
 */

const { GPSPosition, Driver } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const { Op } = require('sequelize');

/**
 * Submit GPS position
 */
const submitPosition = async (positionData) => {
  const { driverId, latitude, longitude, accuracy, speed, heading } = positionData;

  const driver = await Driver.findByPk(driverId);
  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  const position = await GPSPosition.create({
    driverId,
    latitude,
    longitude,
    accuracy,
    speed,
    heading,
    timestamp: new Date()
  });

  await driver.update({
    lastLatitude: latitude,
    lastLongitude: longitude,
    lastPositionUpdate: new Date()
  });

  return position;
};

/**
 * Get current positions of all drivers
 */
const getCurrentPositions = async () => {
  const drivers = await Driver.findAll({
    where: {
      status: { [Op.in]: ['online', 'in_delivery'] }
    },
    attributes: [
      'id',
      'name',
      'phone',
      'status',
      'lastLatitude',
      'lastLongitude',
      'lastPositionUpdate'
    ],
    order: [['lastPositionUpdate', 'DESC']]
  });

  return drivers.map(driver => ({
    driverId: driver.id,
    name: driver.name,
    phone: driver.phone,
    status: driver.status,
    position: {
      latitude: driver.lastLatitude,
      longitude: driver.lastLongitude,
      timestamp: driver.lastPositionUpdate
    }
  }));
};

/**
 * Get current position of a specific driver
 */
const getDriverCurrentPosition = async (driverId) => {
  const driver = await Driver.findByPk(driverId, {
    attributes: [
      'id',
      'name',
      'phone',
      'status',
      'lastLatitude',
      'lastLongitude',
      'lastPositionUpdate'
    ]
  });

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  return {
    driverId: driver.id,
    name: driver.name,
    phone: driver.phone,
    status: driver.status,
    position: {
      latitude: driver.lastLatitude,
      longitude: driver.lastLongitude,
      timestamp: driver.lastPositionUpdate
    }
  };
};

/**
 * Get position history for a driver
 */
const getDriverPositionHistory = async (driverId, filters = {}) => {
  const { startDate, endDate, page = 1, limit = 100 } = filters;
  const offset = (page - 1) * limit;

  const driver = await Driver.findByPk(driverId);
  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  const where = { driverId };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp[Op.gte] = new Date(startDate);
    if (endDate) where.timestamp[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await GPSPosition.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['timestamp', 'DESC']]
  });

  return {
    positions: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

module.exports = {
  submitPosition,
  getCurrentPositions,
  getDriverCurrentPosition,
  getDriverPositionHistory
};
