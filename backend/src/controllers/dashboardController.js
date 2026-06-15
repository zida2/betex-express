/**
 * Dashboard Controller
 * Provides overview statistics for admin dashboard
 */

const { DeliveryRequest, Driver, User } = require('../models');
const revenueService = require('../services/revenueCalculationService');
const logger = require('../utils/logger');

/**
 * GET /dashboard/overview
 * Get dashboard overview with all key metrics
 */
const getOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get today's deliveries
    const todayDeliveries = await DeliveryRequest.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.between]: [today, endOfToday]
        }
      }
    });

    const deliveredToday = todayDeliveries.filter(
      d => d.status === 'completed'
    ).length;
    const inTransit = todayDeliveries.filter(
      d => d.status === 'in_transit'
    ).length;
    const failed = todayDeliveries.filter(
      d => d.status === 'cancelled'
    ).length;
    const pending = todayDeliveries.filter(
      d => d.status === 'pending_approval'
    ).length;

    // Calculate today's revenue
    const todayRevenue = todayDeliveries
      .filter(d => d.status === 'completed' || d.status === 'approved')
      .reduce((sum, d) => sum + (d.deliveryPrice || 0), 0);

    // Count active drivers
    const activeDrivers = await Driver.count({
      where: { status: 'online' }
    });

    const totalDrivers = await Driver.count();

    // Get all deliveries for stats
    const allDeliveries = await DeliveryRequest.count();

    // Get approved deliveries
    const approvedDeliveries = await DeliveryRequest.count({
      where: { status: 'approved' }
    });

    // Get rejected deliveries
    const rejectedDeliveries = await DeliveryRequest.count({
      where: { status: 'rejected' }
    });

    // Calculate success rate
    const completedDeliveries = await DeliveryRequest.count({
      where: { status: 'completed' }
    });

    const failedDeliveries = await DeliveryRequest.count({
      where: { status: 'cancelled' }
    });

    const completionRate =
      completedDeliveries + failedDeliveries > 0
        ? (completedDeliveries /
            (completedDeliveries + failedDeliveries)) *
          100
        : 0;

    // Get recent requests for display
    const recentRequests = await DeliveryRequest.findAll({
      include: [
        {
          model: Driver,
          as: 'driver',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get top drivers by deliveries
    const topDrivers = await Driver.findAll({
      where: { status: 'online' },
      order: [['totalDeliveries', 'DESC']],
      limit: 5
    });

    // Calculate daily profit
    const deliveredDeliveries = todayDeliveries.filter(
      d => d.status === 'completed'
    );
    const dailyExpenses = activeDrivers * 2000; // Fuel per driver
    const dailyProfit = todayRevenue - dailyExpenses;

    logger.info(`Dashboard overview requested`);

    return res.status(200).json({
      success: true,
      data: {
        date: today,
        today: {
          totalDeliveries: todayDeliveries.length,
          deliveredToday,
          inTransit,
          failed,
          pending,
          revenue: todayRevenue,
          expenses: dailyExpenses,
          profit: dailyProfit,
          profitMargin:
            todayRevenue > 0 ? (dailyProfit / todayRevenue) * 100 : 0
        },
        stats: {
          totalDeliveries: allDeliveries,
          approvedDeliveries,
          rejectedDeliveries,
          completedDeliveries,
          failedDeliveries,
          completionRate: Math.round(completionRate * 100) / 100,
          totalDrivers,
          activeDrivers,
          inactiveDrivers: totalDrivers - activeDrivers
        },
        recentRequests: recentRequests.map(req => ({
          id: req.id,
          senderName: req.senderName,
          receiverName: req.receiverName,
          deliveryPrice: req.deliveryPrice,
          status: req.status,
          driverName: req.driver ? req.driver.name : null,
          createdAt: req.createdAt
        })),
        topDrivers: topDrivers.map(driver => ({
          id: driver.id,
          name: driver.name || 'Driver',
          totalDeliveries: driver.totalDeliveries || 0,
          successfulDeliveries: driver.successfulDeliveries || 0,
          rating: driver.rating || 0,
          status: driver.status
        }))
      }
    });
  } catch (error) {
    logger.error('Get dashboard overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message
    });
  }
};

module.exports = {
  getOverview
};
