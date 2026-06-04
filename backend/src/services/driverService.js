/**
 * Driver Service
 * Business logic for driver management
 */

const { Driver, User, Package, Route, GPSPosition } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');

const createDriver = async (driverData) => {
  const { userId, name, phone, email, vehicleType, vehiclePlate } = driverData;

  const driver = await Driver.create({
    userId,
    name,
    phone,
    email,
    vehicleType,
    vehiclePlate,
    status: 'offline'
  });

  return driver;
};

const getDrivers = async (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const { count, rows } = await Driver.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['email', 'firstName', 'lastName'] }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  return {
    drivers: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

const getDriverById = async (driverId) => {
  const driver = await Driver.findByPk(driverId, {
    include: [
      { model: User, attributes: ['email', 'firstName', 'lastName'] },
      { model: Package, limit: 10, order: [['createdAt', 'DESC']] }
    ]
  });

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  return driver;
};

const updateDriver = async (driverId, updates) => {
  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  await driver.update(updates);
  return driver;
};

const updateDriverStatus = async (driverId, status) => {
  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  await driver.update({ status });
  return driver;
};

const getDriverStatistics = async (driverId) => {
  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  return {
    totalDeliveries: driver.totalDeliveries,
    successfulDeliveries: driver.successfulDeliveries,
    failedDeliveries: driver.failedDeliveries,
    rating: driver.rating,
    successRate: driver.totalDeliveries > 0 
      ? ((driver.successfulDeliveries / driver.totalDeliveries) * 100).toFixed(2) 
      : 0
  };
};

const deleteDriver = async (driverId) => {
  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  await driver.destroy();
  return { message: 'Driver deleted successfully' };
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  updateDriverStatus,
  getDriverStatistics,
  deleteDriver
};
