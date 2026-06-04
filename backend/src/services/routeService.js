/**
 * Route Service
 * Business logic for route management
 */

const { Route, Driver, Package } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');

const createRoute = async (routeData) => {
  const { driverId, phase, packageIds } = routeData;

  const driver = await Driver.findByPk(driverId);
  if (!driver) {
    throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');
  }

  const route = await Route.create({
    driverId,
    phase,
    status: 'pending',
    totalPackages: packageIds ? packageIds.length : 0
  });

  if (packageIds && packageIds.length > 0) {
    await Package.update(
      { routeId: route.id, driverId },
      { where: { id: packageIds } }
    );
  }

  return route;
};

const getRoutes = async (filters = {}) => {
  const { driverId, phase, status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where = {};
  if (driverId) where.driverId = driverId;
  if (phase) where.phase = phase;
  if (status) where.status = status;

  const { count, rows } = await Route.findAndCountAll({
    where,
    include: [
      { model: Driver, attributes: ['id', 'name'] },
      { model: Package }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  return {
    routes: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

const getRouteById = async (routeId) => {
  const route = await Route.findByPk(routeId, {
    include: [
      { model: Driver, attributes: ['id', 'name', 'phone'] },
      { model: Package }
    ]
  });

  if (!route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  return route;
};

const updateRouteStatus = async (routeId, status) => {
  const route = await Route.findByPk(routeId);

  if (!route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  const updates = { status };
  if (status === 'in_progress' && !route.startedAt) {
    updates.startedAt = new Date();
  }
  if (status === 'completed') {
    updates.completedAt = new Date();
  }

  await route.update(updates);
  return route;
};

module.exports = {
  createRoute,
  getRoutes,
  getRouteById,
  updateRouteStatus
};
