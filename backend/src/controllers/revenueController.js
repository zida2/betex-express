/**
 * Revenue Controller
 * Handles revenue and profit calculations
 */

const { DeliveryRequest, Driver, User } = require('../models');
const revenueService = require('../services/revenueCalculationService');
const logger = require('../utils/logger');

/**
 * GET /revenue/daily
 * Get daily revenue and profit
 */
const getDailyRevenue = async (req, res) => {
  try {
    const { date, driverId } = req.query;

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all deliveries for the day
  let where = {
    status: ['completed', 'approved'],
    createdAt: {
      [require('sequelize').Op.between]: [startOfDay, endOfDay]
    }
  };

  if (driverId) {
    where.driverId = driverId;
  }

    const deliveries = await DeliveryRequest.findAll({
      where,
      include: [{ model: Driver }]
    });

    // Group deliveries by driver
    const driverDeliveries = {};

    deliveries.forEach(delivery => {
      if (!driverDeliveries[delivery.driverId]) {
        driverDeliveries[delivery.driverId] = [];
      }
      driverDeliveries[delivery.driverId].push(delivery);
    });

    // Calculate metrics for each driver
    const driverMetrics = [];
    let totalRevenue = 0;
    let totalExpenses = 0;

    for (const [driverId, driverDelivs] of Object.entries(driverDeliveries)) {
      const driver = await Driver.findByPk(driverId, {
        include: [{ model: User, attributes: ['first_name', 'last_name'] }]
      });

      if (!driver) continue;

      const metrics = revenueService.calculateDailyMetrics({
        driverId,
        date: targetDate,
        deliveries: driverDelivs,
        fuelCost: 2000
      });

      driverMetrics.push({
        driverId,
        driverName: `${driver.User.first_name} ${driver.User.last_name}`,
        ...metrics,
        deliveries: driverDelivs.length
      });

      totalRevenue += metrics.totalRevenue;
      totalExpenses += metrics.dailyExpenses;
    }

    const totalProfit = totalRevenue - totalExpenses;

    logger.info(
      `Daily revenue calculated for ${targetDate.toDateString()}: ${totalRevenue} FCFA`
    );

    return res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        totalRevenue,
        totalExpenses,
        totalProfit,
        profitMargin:
          totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        numberOfDrivers: driverMetrics.length,
        drivers: driverMetrics
      }
    });
  } catch (error) {
    logger.error('Get daily revenue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get daily revenue',
      error: error.message
    });
  }
};

/**
 * GET /revenue/monthly
 * Get monthly revenue and profit
 */
const getMonthlyRevenue = async (req, res) => {
  try {
    const { year, month, driverId } = req.query;

    // Parse year and month
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    // Get start and end of month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Get all deliveries for the month
  let where = {
    status: ['completed', 'approved'],
    createdAt: {
      [require('sequelize').Op.between]: [startOfMonth, endOfMonth]
    }
  };

  if (driverId) {
    where.driverId = driverId;
  }

    const deliveries = await DeliveryRequest.findAll({
      where,
      include: [{ model: Driver }]
    });

    // Group deliveries by driver
    const driverDeliveries = {};

    deliveries.forEach(delivery => {
      if (!driverDeliveries[delivery.driverId]) {
        driverDeliveries[delivery.driverId] = [];
      }
      driverDeliveries[delivery.driverId].push(delivery);
    });

    // Group deliveries by date for daily metrics
    const dailyMetrics = {};

    for (const [driverId, driverDelivs] of Object.entries(driverDeliveries)) {
      if (!dailyMetrics[driverId]) {
        dailyMetrics[driverId] = [];
      }

      // Group by date
      const byDate = {};
      driverDelivs.forEach(delivery => {
        const dateKey = delivery.created_at.toDateString();
        if (!byDate[dateKey]) {
          byDate[dateKey] = [];
        }
        byDate[dateKey].push(delivery);
      });

      // Calculate daily metrics
      Object.entries(byDate).forEach(([dateStr, dayDeliveries]) => {
        const dayDate = new Date(dateStr);
        const dayMetrics = revenueService.calculateDailyMetrics({
          driverId,
          date: dayDate,
          deliveries: dayDeliveries,
          fuelCost: 2000
        });
        dailyMetrics[driverId].push(dayMetrics);
      });
    }

    // Calculate monthly metrics for each driver
    const driverMetrics = [];
    let totalRevenue = 0;
    let totalFuelExpenses = 0;

    for (const [driverId, dailyMet] of Object.entries(dailyMetrics)) {
      const driver = await Driver.findByPk(driverId, {
        include: [{ model: User, attributes: ['first_name', 'last_name'] }]
      });

      if (!driver) continue;

      const metrics = revenueService.calculateMonthlyMetrics({
        driverId,
        year: targetYear,
        month: targetMonth,
        dailyMetrics: dailyMet,
        salaryAmount: 60000
      });

      driverMetrics.push({
        driverId,
        driverName: `${driver.User.first_name} ${driver.User.last_name}`,
        ...metrics
      });

      totalRevenue += metrics.totalRevenue;
      totalFuelExpenses += metrics.fuelExpenses;
    }

    const totalSalaries = driverMetrics.length * 60000;
    const totalExpenses = totalFuelExpenses + totalSalaries;
    const totalProfit = totalRevenue - totalExpenses;

    logger.info(
      `Monthly revenue calculated for ${targetMonth}/${targetYear}: ${totalRevenue} FCFA`
    );

    return res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        totalRevenue,
        fuelExpenses: totalFuelExpenses,
        salaryExpenses: totalSalaries,
        totalExpenses,
        totalProfit,
        profitMargin:
          totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        numberOfDrivers: driverMetrics.length,
        drivers: driverMetrics
      }
    });
  } catch (error) {
    logger.error('Get monthly revenue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get monthly revenue',
      error: error.message
    });
  }
};

module.exports = {
  getDailyRevenue,
  getMonthlyRevenue
};
