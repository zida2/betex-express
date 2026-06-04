/**
 * Optimization Service
 * Intelligent route and driver assignment
 */

const { Driver, Zone, Package, GPSPosition } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const { Op } = require('sequelize');

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find nearest driver to a zone
 */
const findNearestDriver = async (zoneId, excludeDriverIds = []) => {
  // Get zone coordinates
  const zone = await Zone.findByPk(zoneId);
  if (!zone) {
    throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
  }

  // Get online drivers
  const drivers = await Driver.findAll({
    where: {
      status: { [Op.in]: ['online', 'in_delivery'] },
      id: { [Op.notIn]: excludeDriverIds }
    },
    attributes: ['id', 'name', 'lastLatitude', 'lastLongitude', 'status', 'totalDeliveries', 'successfulDeliveries']
  });

  if (drivers.length === 0) {
    throw new AppError('No available drivers', 400, 'NO_AVAILABLE_DRIVERS');
  }

  // Calculate distance for each driver
  const driversWithDistance = drivers.map(driver => {
    const distance = calculateDistance(
      zone.centerLatitude,
      zone.centerLongitude,
      driver.lastLatitude || 0,
      driver.lastLongitude || 0
    );

    // Calculate success rate
    const successRate = driver.totalDeliveries > 0 
      ? (driver.successfulDeliveries / driver.totalDeliveries) 
      : 0;

    return {
      ...driver.toJSON(),
      distance,
      successRate,
      score: (1 / (distance + 1)) * (successRate + 1) // Scoring algorithm
    };
  });

  // Sort by score (highest first)
  driversWithDistance.sort((a, b) => b.score - a.score);

  return driversWithDistance[0];
};

/**
 * Find best drivers for multiple packages
 */
const optimizePackageAssignment = async (packageIds, zoneId) => {
  const packages = await Package.findAll({
    where: { id: packageIds },
    include: [{ model: Zone, attributes: ['name', 'centerLatitude', 'centerLongitude'] }]
  });

  if (packages.length === 0) {
    throw new AppError('No packages found', 404, 'PACKAGES_NOT_FOUND');
  }

  const assignments = [];
  const assignedDriverIds = [];

  for (const pkg of packages) {
    try {
      const nearestDriver = await findNearestDriver(pkg.zoneId, assignedDriverIds);
      
      assignments.push({
        packageId: pkg.id,
        driverId: nearestDriver.id,
        driverName: nearestDriver.name,
        distance: nearestDriver.distance,
        successRate: nearestDriver.successRate,
        score: nearestDriver.score
      });

      assignedDriverIds.push(nearestDriver.id);
    } catch (error) {
      // If no driver available for this package, continue
      console.warn(`Could not assign driver for package ${pkg.id}:`, error.message);
    }
  }

  return assignments;
};

/**
 * Get driver workload
 */
const getDriverWorkload = async (driverId) => {
  const driver = await Driver.findByPk(driverId);
  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  // Get assigned packages
  const assignedPackages = await Package.findAll({
    where: {
      driverId,
      status: { [Op.in]: ['collected', 'in_delivery'] }
    }
  });

  // Calculate total weight
  const totalWeight = assignedPackages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0);

  return {
    driverId,
    driverName: driver.name,
    assignedPackages: assignedPackages.length,
    totalWeight,
    status: driver.status,
    successRate: driver.totalDeliveries > 0 
      ? (driver.successfulDeliveries / driver.totalDeliveries) 
      : 0
  };
};

/**
 * Get all drivers workload
 */
const getAllDriversWorkload = async () => {
  const drivers = await Driver.findAll({
    attributes: ['id', 'name', 'status', 'totalDeliveries', 'successfulDeliveries']
  });

  const workloads = await Promise.all(
    drivers.map(driver => getDriverWorkload(driver.id))
  );

  return workloads.sort((a, b) => a.assignedPackages - b.assignedPackages);
};

/**
 * Suggest best driver for a package
 */
const suggestBestDriver = async (packageId) => {
  const pkg = await Package.findByPk(packageId, {
    include: [{ model: Zone }]
  });

  if (!pkg) {
    throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
  }

  const nearestDriver = await findNearestDriver(pkg.zoneId);

  return {
    packageId,
    suggestedDriver: {
      id: nearestDriver.id,
      name: nearestDriver.name,
      distance: nearestDriver.distance.toFixed(2),
      successRate: (nearestDriver.successRate * 100).toFixed(1),
      status: nearestDriver.status
    }
  };
};

/**
 * Suggest driver based on coordinates (for new package creation)
 */
const suggestDriverByLocation = async (latitude, longitude) => {
  // Get online drivers
  const drivers = await Driver.findAll({
    where: {
      status: { [Op.in]: ['online', 'in_delivery'] }
    },
    attributes: ['id', 'name', 'phone', 'lastLatitude', 'lastLongitude', 'status', 'totalDeliveries', 'successfulDeliveries']
  });

  if (drivers.length === 0) {
    throw new AppError('No available drivers', 400, 'NO_AVAILABLE_DRIVERS');
  }

  // Calculate distance for each driver
  const driversWithDistance = drivers.map(driver => {
    const distance = calculateDistance(
      latitude,
      longitude,
      driver.lastLatitude || 0,
      driver.lastLongitude || 0
    );

    // Calculate success rate
    const successRate = driver.totalDeliveries > 0 
      ? (driver.successfulDeliveries / driver.totalDeliveries) 
      : 0;

    return {
      ...driver.toJSON(),
      distance,
      successRate,
      score: (1 / (distance + 1)) * (successRate + 1) // Scoring algorithm
    };
  });

  // Sort by score (highest first)
  driversWithDistance.sort((a, b) => b.score - a.score);

  const bestDriver = driversWithDistance[0];

  return {
    id: bestDriver.id,
    name: bestDriver.name,
    phone: bestDriver.phone,
    distance: bestDriver.distance,
    successRate: (bestDriver.successRate * 100).toFixed(1),
    status: bestDriver.status,
    totalDeliveries: bestDriver.totalDeliveries
  };
};

module.exports = {
  calculateDistance,
  findNearestDriver,
  optimizePackageAssignment,
  getDriverWorkload,
  getAllDriversWorkload,
  suggestBestDriver,
  suggestDriverByLocation
};
