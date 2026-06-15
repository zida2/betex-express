/**
 * Expense Controller
 * Manages driver and administrative expense tracking
 */

const { Expense, User, Driver } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Submit expense
 * POST /api/v1/expenses
 */
exports.submitExpense = async (req, res) => {
  try {
    const { type, category, amount, description, date, photoUrl, driverId } = req.body;
    
    // Validate required fields
    if (!type || !category || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, category, amount, and description are required'
      });
    }
    
    // Validate type matches user role
    if (type === 'driver' && req.user.role !== 'driver' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers or admins can submit driver expenses'
      });
    }
    
    if (type === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can submit administrative expenses'
      });
    }
    
    // Create expense
    const expense = await Expense.create({
      userId: req.user.role === 'admin' ? null : req.user.id,
      driverId: driverId || null,
      type,
      category,
      amount: parseFloat(amount),
      description,
      date: date || new Date(),
      photoUrl: photoUrl || null,
      status: (type === 'admin' || req.user.role === 'admin') ? 'approved' : 'pending' // Admin expenses or admin-submitted auto-approved
    });
    
    // If admin expense, set approvedBy and approvedAt
    if (type === 'admin') {
      expense.approvedBy = req.user.id;
      expense.approvedAt = new Date();
      await expense.save();
    }
    
    // Fetch complete expense with user and driver info
    const completeExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        }
      ]
    });
    
    logger.info(`Expense created: ${expense.id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      data: completeExpense
    });
  } catch (error) {
    logger.error('Error submitting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting expense',
      error: error.message
    });
  }
};

/**
 * Get expenses
 * GET /api/v1/expenses
 */
exports.getExpenses = async (req, res) => {
  try {
    const { type, status, startDate, endDate, userId, category, driverId } = req.query;
    
    const whereClause = {};
    
    // If not admin, only show own expenses
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }
    
    if (driverId) whereClause.driverId = driverId;
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: expenses
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
 * Get expense by ID
 * GET /api/v1/expenses/:id
 */
exports.getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && expense.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this expense'
      });
    }
    
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    logger.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

/**
 * Approve expense (Admin)
 * PUT /api/v1/expenses/:id/approve
 */
exports.approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const expense = await Expense.findByPk(id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve expense with status: ${expense.status}`
      });
    }
    
    expense.status = 'approved';
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    
    await expense.save();
    
    // Fetch complete expense
    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
    
    logger.info(`Expense ${id} approved by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: updatedExpense
    });
  } catch (error) {
    logger.error('Error approving expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving expense',
      error: error.message
    });
  }
};

/**
 * Reject expense (Admin)
 * PUT /api/v1/expenses/:id/reject
 */
exports.rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const expense = await Expense.findByPk(id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject expense with status: ${expense.status}`
      });
    }
    
    expense.status = 'rejected';
    expense.rejectionReason = rejectionReason;
    
    await expense.save();
    
    logger.info(`Expense ${id} rejected by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Expense rejected',
      data: expense
    });
  } catch (error) {
    logger.error('Error rejecting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting expense',
      error: error.message
    });
  }
};

/**
 * Get expense summary
 * GET /api/v1/expenses/summary
 */
exports.getExpenseSummary = async (req, res) => {
  try {
    const { period, type, startDate, endDate } = req.query;
    
    const whereClause = { status: 'approved' };
    
    if (type) whereClause.type = type;
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    } else if (period) {
      // Calculate date range based on period
      const now = new Date();
      if (period === 'today') {
        whereClause.date = {
          [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
        };
      } else if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        whereClause.date = { [Op.gte]: weekAgo };
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        whereClause.date = { [Op.gte]: monthAgo };
      }
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      attributes: [
        'type',
        'category',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['type', 'category']
    });
    
    // Calculate totals
    const summary = {
      driverExpenses: 0,
      adminExpenses: 0,
      totalExpenses: 0,
      byCategory: {},
      expenseCount: 0
    };
    
    expenses.forEach(expense => {
      const total = parseFloat(expense.dataValues.total);
      const count = parseInt(expense.dataValues.count);
      
      if (expense.type === 'driver') {
        summary.driverExpenses += total;
      } else if (expense.type === 'admin') {
        summary.adminExpenses += total;
      }
      
      summary.totalExpenses += total;
      summary.expenseCount += count;
      
      if (!summary.byCategory[expense.category]) {
        summary.byCategory[expense.category] = { total: 0, count: 0 };
      }
      summary.byCategory[expense.category].total += total;
      summary.byCategory[expense.category].count += count;
    });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error fetching expense summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense summary',
      error: error.message
    });
  }
};

/**
 * Get driver fuel expenses by date
 * GET /api/v1/expenses/drivers/fuel
 */
exports.getDriverFuelExpenses = async (req, res) => {
  try {
    const { driverId, date } = req.query;
    
    const whereClause = {
      category: 'fuel',
      type: 'driver'
    };
    
    if (driverId) whereClause.driverId = driverId;
    if (date) whereClause.date = date;
    
    const fuelExpenses = await Expense.findAll({
      where: whereClause,
      attributes: ['driverId', 'amount', 'date'],
      order: [['date', 'DESC']]
    });
    
    // Create a simple array of driverId and amount
    const data = fuelExpenses
      .filter(e => e.driverId)
      .map(e => ({
        driverId: e.driverId,
        amount: parseFloat(e.amount),
        date: e.date
      }));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error fetching driver fuel expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver fuel expenses',
      error: error.message
    });
  }
};

/**
 * Set or update driver fuel expense for a specific day
 * POST /api/v1/expenses/drivers/fuel
 */
exports.setDriverFuelExpense = async (req, res) => {
  try {
    const { driverId, amount, date, description } = req.body;
    
    if (!driverId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID and amount are required'
      });
    }
    
    // Check if driver exists
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Delete existing fuel expenses for this driver and date to avoid duplicates
    await Expense.destroy({
      where: {
        driverId,
        date: date || new Date(),
        category: 'fuel',
        type: 'driver'
      }
    });
    
    // Create new fuel expense
    const fuelExpense = await Expense.create({
      driverId,
      userId: req.user.id,
      type: 'driver',
      category: 'fuel',
      amount: parseFloat(amount),
      description: description || 'Carburant quotidien',
      date: date || new Date(),
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    const completeFuelExpense = await Expense.findByPk(fuelExpense.id, {
      include: [
        {
          model: Driver,
          as: 'Driver',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        }
      ]
    });
    
    logger.info(`Fuel expense set for driver ${driverId} on ${date || new Date()}: ${amount} FCFA`);
    
    res.json({
      success: true,
      message: 'Driver fuel expense set successfully',
      data: completeFuelExpense
    });
  } catch (error) {
    logger.error('Error setting driver fuel expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting driver fuel expense',
      error: error.message
    });
  }
};
