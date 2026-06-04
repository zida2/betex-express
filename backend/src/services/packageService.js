/**
 * Package Service
 * Business logic for package management
 */

const { Package, Zone, Driver, Route, DeliveryHistory } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const { calculateDistance, calculatePrice } = require('../utils/distance.utils');
const { Op } = require('sequelize');

/**
 * Create a new package
 */
const createPackage = async (packageData) => {
  const { 
    customerName, 
    customerPhone,
    phone, 
    address,
    senderName,
    senderPhone,
    senderAddress,
    senderLatitude,
    senderLongitude,
    packageType,
    packagePrice,
    deliveryPrice,
    pickupZoneId, 
    pickupAddress,
    pickupLatitude,
    pickupLongitude,
    deliveryZoneId, 
    deliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    deliveryPhase, 
    notes,
    weight,
    driverId
  } = packageData;

  // Use new fields or fallback to old ones for compatibility
  const finalCustomerName = customerName || packageData.customerName;
  const finalCustomerPhone = customerPhone || phone;
  const finalDeliveryAddress = address || deliveryAddress;
  const finalPickupAddress = senderAddress || pickupAddress;
  const finalPickupLat = senderLatitude || pickupLatitude;
  const finalPickupLng = senderLongitude || pickupLongitude;

  // Calculate distance if coordinates are provided
  let distance = null;
  if (finalPickupLat && finalPickupLng && deliveryLatitude && deliveryLongitude) {
    distance = calculateDistance(finalPickupLat, finalPickupLng, deliveryLatitude, deliveryLongitude);
  }

  // Calculate estimated price
  const estimatedPrice = distance ? calculatePrice(distance, weight || 0) : null;

  const package = await Package.create({
    customerName: finalCustomerName,
    customerPhone: finalCustomerPhone,
    phone: finalCustomerPhone,
    address: finalDeliveryAddress,
    senderName,
    senderPhone,
    senderAddress,
    senderLatitude: finalPickupLat,
    senderLongitude: finalPickupLng,
    packageType,
    packagePrice: packagePrice || 0,
    deliveryPrice: deliveryPrice || 0,
    pickupZoneId,
    pickupAddress: finalPickupAddress,
    pickupLatitude: finalPickupLat,
    pickupLongitude: finalPickupLng,
    deliveryZoneId,
    deliveryAddress: finalDeliveryAddress,
    deliveryLatitude,
    deliveryLongitude,
    distance,
    estimatedPrice,
    deliveryPhase: deliveryPhase || 'morning_collection',
    notes,
    weight,
    driverId,
    status: 'pending'
  });

  return package;
};

/**
 * Get all packages with filtering
 */
const getPackages = async (filters = {}) => {
  const { status, pickupZoneId, deliveryZoneId, driverId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (pickupZoneId) where.pickupZoneId = pickupZoneId;
  if (deliveryZoneId) where.deliveryZoneId = deliveryZoneId;
  if (driverId) where.driverId = driverId;

  const { count, rows } = await Package.findAndCountAll({
    where,
    include: [
      { model: Zone, as: 'PickupZone', attributes: ['id', 'name'] },
      { model: Zone, as: 'DeliveryZone', attributes: ['id', 'name'] },
      { model: Driver, attributes: ['id', 'name'] },
      { model: Route, attributes: ['id', 'phase', 'status'] }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  return {
    packages: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

/**
 * Get package by ID
 */
const getPackageById = async (packageId) => {
  const package = await Package.findByPk(packageId, {
    include: [
      { model: Zone, as: 'PickupZone', attributes: ['id', 'name'] },
      { model: Zone, as: 'DeliveryZone', attributes: ['id', 'name'] },
      { model: Driver, attributes: ['id', 'name', 'phone'] },
      { model: Route, attributes: ['id', 'phase', 'status'] }
    ]
  });

  if (!package) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  return package;
};

/**
 * Update package
 */
const updatePackage = async (packageId, updates) => {
  const package = await Package.findByPk(packageId);

  if (!package) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  // Don't allow updating if delivered or cancelled
  if (['delivered', 'cancelled'].includes(package.status)) {
    throw new AppError('Cannot update delivered or cancelled package', 400, 'INVALID_OPERATION');
  }

  // Recalculate distance and price if coordinates changed
  if (updates.pickupLatitude || updates.deliveryLatitude) {
    const lat1 = updates.pickupLatitude || package.pickupLatitude;
    const lon1 = updates.pickupLongitude || package.pickupLongitude;
    const lat2 = updates.deliveryLatitude || package.deliveryLatitude;
    const lon2 = updates.deliveryLongitude || package.deliveryLongitude;

    if (lat1 && lon1 && lat2 && lon2) {
      updates.distance = calculateDistance(lat1, lon1, lat2, lon2);
      updates.estimatedPrice = calculatePrice(updates.distance, updates.weight || package.weight || 0);
    }
  }

  await package.update(updates);
  return package;
};

/**
 * Delete package
 */
const deletePackage = async (packageId) => {
  const package = await Package.findByPk(packageId);

  if (!package) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  // Don't allow deleting if in delivery or delivered
  if (['in_delivery', 'delivered'].includes(package.status)) {
    throw new AppError('Cannot delete package in delivery or delivered', 400, 'INVALID_OPERATION');
  }

  await package.destroy();
  return { message: 'Package deleted successfully' };
};

/**
 * Update package status
 */
const updatePackageStatus = async (packageId, status, notes, failureReason, userId) => {
  const package = await Package.findByPk(packageId);

  if (!package) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  // Validate status transition
  const validTransitions = {
    pending: ['collected', 'cancelled'],
    collected: ['in_delivery', 'cancelled'],
    in_delivery: ['delivered', 'delivery_failed'],
    delivered: [],
    delivery_failed: ['in_delivery'],
    cancelled: []
  };

  if (!validTransitions[package.status].includes(status)) {
    throw new AppError('Invalid status transition', 400, 'INVALID_STATUS_TRANSITION');
  }

  // Update package
  await package.update({
    status,
    notes: notes || package.notes,
    failureReason: status === 'delivery_failed' ? failureReason : null
  });

  // Create delivery history record
  await DeliveryHistory.create({
    packageId: package.id,
    driverId: package.driverId,
    status,
    statusChangedBy: userId,
    notes,
    failureReason,
    timestamp: new Date()
  });

  return package;
};

/**
 * Get package delivery history
 */
const getPackageHistory = async (packageId) => {
  const package = await Package.findByPk(packageId);

  if (!package) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  const history = await DeliveryHistory.findAll({
    where: { packageId },
    include: [
      { model: Driver, attributes: ['id', 'name'] }
    ],
    order: [['timestamp', 'DESC']]
  });

  return history;
};

module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  updatePackageStatus,
  getPackageHistory
};
