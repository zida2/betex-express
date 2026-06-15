/**
 * Driver Service
 * Business logic for driver management
 */

const { Driver, User, Package, Route, GPSPosition } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const bcrypt = require('bcryptjs');

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const createDriver = async (driverData) => {
  const { firstName, lastName, email, phone, cnib, vehicleType, vehiclePlate } = driverData;

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');
  }

  // Generate temporary password
  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Create user with driver role
  const user = await User.create({
    email,
    passwordHash,
    role: 'driver',
    firstName,
    lastName,
    phone,
    isActive: true
  });

  // Create driver
  const driver = await Driver.create({
    userId: user.id,
    name: `${firstName} ${lastName}`,
    phone,
    email,
    cnib,
    vehicleType,
    vehiclePlate,
    status: 'offline'
  });

  // Return driver with credentials
  return {
    ...driver.toJSON(),
    credentials: {
      email,
      password: tempPassword
    }
  };
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
  const { firstName, lastName, email, phone, cnib, vehicleType, vehiclePlate } = updates;

  const driver = await Driver.findByPk(driverId);

  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  // Update User if needed
  if (firstName || lastName || email || phone) {
    const user = await User.findByPk(driver.userId);
    if (user) {
      const userUpdates = {};
      if (firstName) userUpdates.firstName = firstName;
      if (lastName) userUpdates.lastName = lastName;
      if (email) userUpdates.email = email;
      if (phone) userUpdates.phone = phone;
      await user.update(userUpdates);
    }
  }

  // Update Driver
  const driverUpdates = {};
  if (phone) driverUpdates.phone = phone;
  if (email) driverUpdates.email = email;
  if (cnib) driverUpdates.cnib = cnib;
  if (vehicleType) driverUpdates.vehicleType = vehicleType;
  if (vehiclePlate) driverUpdates.vehiclePlate = vehiclePlate;
  if (firstName || lastName) {
    driverUpdates.name = `${firstName || driver.name.split(' ')[0]} ${lastName || driver.name.split(' ').slice(1).join(' ')}`;
  }

  await driver.update(driverUpdates);
  
  // Return updated driver with user data
  const updatedDriver = await Driver.findByPk(driverId, {
    include: [{ model: User, attributes: ['email', 'firstName', 'lastName'] }]
  });
  
  return updatedDriver;
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

  // Delete associated user
  if (driver.userId) {
    const user = await User.findByPk(driver.userId);
    if (user) {
      await user.destroy();
    }
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