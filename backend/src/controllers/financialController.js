/**
 * Financial Controller
 * Manages financial analytics and reporting
 */

const { Expense, Shipment, ScheduledDelivery, DeliveryRequest, FinancialRecord, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get financial dashboard data
 * GET /api/v1/financial/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    // Calculate date range
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    } else if (period) {
      const now = new Date();
      if (period === 'today') {
        dateRange = {
          [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
        };
      } else if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateRange = { [Op.gte]: weekAgo };
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateRange = { [Op.gte]: monthAgo };
      } else if (period === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        dateRange = { [Op.gte]: yearAgo };
      }
    }
    
    // Calculate revenue from different sources
    const shipmentRevenue = await Shipment.sum('totalAmount', {
      where: {
        paymentStatus: 'paid',
        ...(Object.keys(dateRange).length > 0 && { paidAt: dateRange })
      }
    }) || 0;
    
    const scheduledDeliveryRevenue = await ScheduledDelivery.sum('price', {
      where: {
        status: 'completed',
        ...(Object.keys(dateRange).length > 0 && { completedAt: dateRange })
      }
    }) || 0;
    
    const deliveryRevenue = await DeliveryRequest.sum('deliveryPrice', {
      where: {
        status: 'completed',
        isPaid: true,
        ...(Object.keys(dateRange).length > 0 && { updatedAt: dateRange })
      }
    }) || 0;
    
    const totalRevenue = shipmentRevenue + scheduledDeliveryRevenue + deliveryRevenue;
    
    // Calculate expenses
    const driverExpenses = await Expense.sum('amount', {
      where: {
        type: 'driver',
        status: 'approved',
        ...(Object.keys(dateRange).length > 0 && { date: dateRange })
      }
    }) || 0;
    
    const adminExpenses = await Expense.sum('amount', {
      where: {
        type: 'admin',
        status: 'approved',
        ...(Object.keys(dateRange).length > 0 && { date: dateRange })
      }
    }) || 0;
    
    const totalExpenses = driverExpenses + adminExpenses;
    
    // Calculate profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;
    
    // Count deliveries
    const shipmentsCount = await Shipment.count({
      where: {
        paymentStatus: 'paid',
        ...(Object.keys(dateRange).length > 0 && { paidAt: dateRange })
      }
    });
    
    const scheduledDeliveriesCount = await ScheduledDelivery.count({
      where: {
        status: 'completed',
        ...(Object.keys(dateRange).length > 0 && { completedAt: dateRange })
      }
    });
    
    const deliveriesCount = await DeliveryRequest.count({
      where: {
        status: 'completed',
        ...(Object.keys(dateRange).length > 0 && { updatedAt: dateRange })
      }
    });
    
    const dashboard = {
      revenue: {
        shipments: parseFloat(shipmentRevenue),
        scheduledDeliveries: parseFloat(scheduledDeliveryRevenue),
        deliveries: parseFloat(deliveryRevenue),
        total: parseFloat(totalRevenue)
      },
      expenses: {
        driver: parseFloat(driverExpenses),
        admin: parseFloat(adminExpenses),
        total: parseFloat(totalExpenses)
      },
      profit: {
        net: parseFloat(netProfit),
        margin: parseFloat(profitMargin)
      },
      counts: {
        shipments: shipmentsCount,
        scheduledDeliveries: scheduledDeliveriesCount,
        deliveries: deliveriesCount,
        total: shipmentsCount + scheduledDeliveriesCount + deliveriesCount
      },
      period: period || 'custom',
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Error fetching financial dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial dashboard',
      error: error.message
    });
  }
};

/**
 * Get revenue breakdown
 * GET /api/v1/financial/revenue
 */
exports.getRevenue = async (req, res) => {
  try {
    const { period, source, startDate, endDate } = req.query;
    
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }
    
    const revenue = {
      sources: {},
      total: 0
    };
    
    if (!source || source === 'shipments') {
      const shipments = await Shipment.findAll({
        where: {
          paymentStatus: 'paid',
          ...(Object.keys(dateRange).length > 0 && { paidAt: dateRange })
        },
        attributes: ['id', 'trackingNumber', 'totalAmount', 'paidAt'],
        order: [['paidAt', 'DESC']],
        limit: 100
      });
      
      const shipmentTotal = shipments.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
      revenue.sources.shipments = {
        total: shipmentTotal,
        count: shipments.length,
        items: shipments
      };
      revenue.total += shipmentTotal;
    }
    
    if (!source || source === 'scheduled') {
      const scheduledDeliveries = await ScheduledDelivery.findAll({
        where: {
          status: 'completed',
          ...(Object.keys(dateRange).length > 0 && { completedAt: dateRange })
        },
        attributes: ['id', 'trackingNumber', 'price', 'completedAt'],
        order: [['completedAt', 'DESC']],
        limit: 100
      });
      
      const scheduledTotal = scheduledDeliveries.reduce((sum, s) => sum + parseFloat(s.price), 0);
      revenue.sources.scheduled = {
        total: scheduledTotal,
        count: scheduledDeliveries.length,
        items: scheduledDeliveries
      };
      revenue.total += scheduledTotal;
    }
    
    if (!source || source === 'deliveries') {
      const deliveries = await DeliveryRequest.findAll({
        where: {
          status: 'completed',
          isPaid: true,
          ...(Object.keys(dateRange).length > 0 && { updatedAt: dateRange })
        },
        attributes: ['id', 'trackingNumber', 'deliveryPrice', 'updatedAt'],
        order: [['updatedAt', 'DESC']],
        limit: 100
      });
      
      const deliveryTotal = deliveries.reduce((sum, d) => sum + parseFloat(d.deliveryPrice || 0), 0);
      revenue.sources.deliveries = {
        total: deliveryTotal,
        count: deliveries.length,
        items: deliveries
      };
      revenue.total += deliveryTotal;
    }
    
    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    logger.error('Error fetching revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue',
      error: error.message
    });
  }
};

/**
 * Get expenses breakdown
 * GET /api/v1/financial/expenses
 */
exports.getExpenses = async (req, res) => {
  try {
    const { period, category, startDate, endDate } = req.query;
    
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }
    
    const whereClause = {
      status: 'approved',
      ...(Object.keys(dateRange).length > 0 && { date: dateRange })
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'role']
        }
      ],
      order: [['date', 'DESC']],
      limit: 200
    });
    
    // Group by category and type
    const breakdown = {
      byCategory: {},
      byType: {
        driver: 0,
        admin: 0
      },
      total: 0,
      items: expenses
    };
    
    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      
      // By category
      if (!breakdown.byCategory[expense.category]) {
        breakdown.byCategory[expense.category] = {
          total: 0,
          count: 0
        };
      }
      breakdown.byCategory[expense.category].total += amount;
      breakdown.byCategory[expense.category].count += 1;
      
      // By type
      breakdown.byType[expense.type] += amount;
      
      // Total
      breakdown.total += amount;
    });
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

/**
 * Get profit analysis
 * GET /api/v1/financial/profit
 */
exports.getProfit = async (req, res) => {
  try {
    const { period } = req.query;
    
    // Get data for multiple periods for comparison
    const periods = [];
    
    if (period === 'daily') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        periods.push({
          label: startOfDay.toISOString().split('T')[0],
          start: startOfDay,
          end: endOfDay
        });
      }
    } else if (period === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        periods.push({
          label: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          start: startOfMonth,
          end: endOfMonth
        });
      }
    }
    
    const profitData = [];
    
    for (const periodItem of periods) {
      // Revenue
      const shipmentRevenue = await Shipment.sum('totalAmount', {
        where: {
          paymentStatus: 'paid',
          paidAt: { [Op.between]: [periodItem.start, periodItem.end] }
        }
      }) || 0;
      
      const scheduledRevenue = await ScheduledDelivery.sum('price', {
        where: {
          status: 'completed',
          completedAt: { [Op.between]: [periodItem.start, periodItem.end] }
        }
      }) || 0;
      
      const deliveryRevenue = await DeliveryRequest.sum('deliveryPrice', {
        where: {
          status: 'completed',
          isPaid: true,
          updatedAt: { [Op.between]: [periodItem.start, periodItem.end] }
        }
      }) || 0;
      
      const totalRevenue = shipmentRevenue + scheduledRevenue + deliveryRevenue;
      
      // Expenses
      const totalExpenses = await Expense.sum('amount', {
        where: {
          status: 'approved',
          date: { [Op.between]: [periodItem.start, periodItem.end] }
        }
      }) || 0;
      
      const netProfit = totalRevenue - totalExpenses;
      
      profitData.push({
        period: periodItem.label,
        revenue: parseFloat(totalRevenue),
        expenses: parseFloat(totalExpenses),
        profit: parseFloat(netProfit),
        margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
      });
    }
    
    res.json({
      success: true,
      data: {
        period: period || 'custom',
        data: profitData
      }
    });
  } catch (error) {
    logger.error('Error fetching profit analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profit analysis',
      error: error.message
    });
  }
};

/**
 * Generate financial report
 * POST /api/v1/financial/report
 */
exports.generateReport = async (req, res) => {
  try {
    const { period, format, startDate, endDate } = req.body;
    
    // For now, return JSON report
    // TODO: Implement PDF/Excel generation
    
    const report = {
      generatedAt: new Date(),
      period: period || 'custom',
      dateRange: {
        start: startDate || null,
        end: endDate || null
      },
      format: format || 'json'
    };
    
    // Get dashboard data for the report
    req.query = { period, startDate, endDate };
    const dashboardData = await exports.getDashboard(req, { json: (data) => data });
    
    report.summary = dashboardData.data;
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};
