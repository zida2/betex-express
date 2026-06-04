/**
 * Dashboard Service
 * Business logic for dashboard statistics
 */

const { Package, Driver, Route } = require('../models');
const { Op } = require('sequelize');

const getOverview = async () => {
  const totalPackages = await Package.count();
  
  const packagesByStatus = await Package.findAll({
    attributes: [
      'status',
      [Package.sequelize.fn('COUNT', Package.sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const statusCounts = packagesByStatus.reduce((acc, item) => {
    acc[item.status] = parseInt(item.count);
    return acc;
  }, {});

  const totalDrivers = await Driver.count();
  const activeDrivers = await Driver.count({
    where: { status: { [Op.in]: ['online', 'in_delivery'] } }
  });

  const deliveredCount = statusCounts.delivered || 0;
  const completionRate = totalPackages > 0 
    ? ((deliveredCount / totalPackages) * 100).toFixed(2) 
    : 0;

  return {
    totalPackages,
    packagesByStatus: {
      pending: statusCounts.pending || 0,
      collected: statusCounts.collected || 0,
      in_delivery: statusCounts.in_delivery || 0,
      delivered: statusCounts.delivered || 0,
      delivery_failed: statusCounts.delivery_failed || 0,
      cancelled: statusCounts.cancelled || 0
    },
    totalDrivers,
    activeDrivers,
    completionRate: parseFloat(completionRate)
  };
};

const getDriverStatistics = async () => {
  const drivers = await Driver.findAll({
    attributes: [
      'id',
      'name',
      'status',
      'totalDeliveries',
      'successfulDeliveries',
      'failedDeliveries',
      'rating'
    ],
    order: [['successfulDeliveries', 'DESC']]
  });

  return drivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    status: driver.status,
    totalDeliveries: driver.totalDeliveries,
    successfulDeliveries: driver.successfulDeliveries,
    failedDeliveries: driver.failedDeliveries,
    rating: driver.rating,
    successRate: driver.totalDeliveries > 0 
      ? ((driver.successfulDeliveries / driver.totalDeliveries) * 100).toFixed(2) 
      : 0
  }));
};

module.exports = {
  getOverview,
  getDriverStatistics
};
