/**
 * Client Stock Controller
 * Manages client-specific inventory operations
 */

const { Stock, StockMovement, Product, User, ClientStorage } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get client's stock inventory
 * GET /api/v1/client-stock
 */
exports.getClientStock = async (req, res) => {
  try {
    const { productId } = req.query;
    const clientId = req.user.role === 'client' ? req.user.id : req.query.clientId;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }
    
    // Check if client has active storage service
    const storageService = await ClientStorage.findOne({
      where: { clientId, status: 'active' }
    });
    
    if (!storageService && req.user.role === 'client') {
      return res.status(403).json({
        success: false,
        message: 'Storage service not activated for this client'
      });
    }
    
    const whereClause = { clientId };
    if (productId) {
      whereClause.productId = productId;
    }
    
    const stocks = await Stock.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'description', 'price']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error fetching client stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock',
      error: error.message
    });
  }
};

/**
 * Add product to client stock
 * POST /api/v1/client-stock
 */
exports.addProductToStock = async (req, res) => {
  try {
    const { clientId, productId, quantity, location } = req.body;
    
    // Validate required fields
    if (!clientId || !productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Client ID, Product ID, and quantity are required'
      });
    }
    
    // Check if client has active storage service
    const storageService = await ClientStorage.findOne({
      where: { clientId, status: 'active' }
    });
    
    if (!storageService) {
      return res.status(403).json({
        success: false,
        message: 'Storage service not activated for this client'
      });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if stock entry already exists
    let stock = await Stock.findOne({
      where: { clientId, productId }
    });
    
    if (stock) {
      // Update existing stock
      stock.quantity += parseInt(quantity);
      stock.lastRestockDate = new Date();
      if (location) stock.location = location;
      await stock.save();
      
      // Record movement
      await StockMovement.create({
        stockId: stock.id,
        type: 'in',
        quantity: parseInt(quantity),
        reason: 'Restock',
        userId: req.user.id,
        timestamp: new Date()
      });
    } else {
      // Create new stock entry
      stock = await Stock.create({
        productId,
        clientId,
        quantity: parseInt(quantity),
        location: location || null,
        lastRestockDate: new Date()
      });
      
      // Record initial movement
      await StockMovement.create({
        stockId: stock.id,
        type: 'in',
        quantity: parseInt(quantity),
        reason: 'Initial stock',
        userId: req.user.id,
        timestamp: new Date()
      });
    }
    
    // Fetch complete stock with product info
    const completeStock = await Stock.findByPk(stock.id, {
      include: [{ model: Product }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Product added to stock successfully',
      data: completeStock
    });
  } catch (error) {
    logger.error('Error adding product to stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product to stock',
      error: error.message
    });
  }
};

/**
 * Update stock quantity
 * PUT /api/v1/client-stock/:id
 */
exports.updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation, reason } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and operation (add/subtract) are required'
      });
    }
    
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    const quantityNum = parseInt(quantity);
    const movementType = operation === 'add' ? 'in' : 'out';
    
    if (operation === 'add') {
      stock.quantity += quantityNum;
      stock.lastRestockDate = new Date();
    } else if (operation === 'subtract') {
      if (stock.quantity < quantityNum) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock quantity'
        });
      }
      stock.quantity -= quantityNum;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Use "add" or "subtract"'
      });
    }
    
    await stock.save();
    
    // Record movement
    await StockMovement.create({
      stockId: stock.id,
      type: movementType,
      quantity: quantityNum,
      reason: reason || `Stock ${operation}`,
      userId: req.user.id,
      timestamp: new Date()
    });
    
    // Fetch updated stock with product info
    const updatedStock = await Stock.findByPk(id, {
      include: [{ model: Product }]
    });
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedStock
    });
  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};

/**
 * Get stock movement history
 * GET /api/v1/client-stock/movements
 */
exports.getStockMovements = async (req, res) => {
  try {
    const { startDate, endDate, type, stockId } = req.query;
    const clientId = req.user.role === 'client' ? req.user.id : req.query.clientId;
    
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }
    
    // Build where clause for stock
    const stockWhere = { clientId };
    if (stockId) {
      stockWhere.id = stockId;
    }
    
    // Build where clause for movements
    const movementWhere = {};
    if (type) {
      movementWhere.type = type;
    }
    if (startDate || endDate) {
      movementWhere.timestamp = {};
      if (startDate) movementWhere.timestamp[Op.gte] = new Date(startDate);
      if (endDate) movementWhere.timestamp[Op.lte] = new Date(endDate);
    }
    
    const movements = await StockMovement.findAll({
      where: movementWhere,
      include: [
        {
          model: Stock,
          where: stockWhere,
          include: [
            {
              model: Product,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 100
    });
    
    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    logger.error('Error fetching stock movements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock movements',
      error: error.message
    });
  }
};

/**
 * Get stock movement history by client ID
 * GET /api/v1/client-stock/history/:clientId
 */
exports.getClientMovementHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { days = 30 } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const movements = await StockMovement.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        {
          model: Stock,
          where: { clientId },
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'unit']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    
    res.json({
      success: true,
      data: movements
    });
  } catch (error) {
    logger.error('Error fetching client movement history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movement history',
      error: error.message
    });
  }
};

/**
 * Record stock movement (alternative endpoint with stock ID in URL)
 * PUT /api/v1/client-stock/:id/movement
 */
exports.recordStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, reference, notes } = req.body;
    
    if (!type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Type and quantity are required'
      });
    }
    
    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    // Create movement record
    const movement = await StockMovement.create({
      stockId: id,
      type,
      quantity: parseInt(quantity),
      reason: reason || 'Manual adjustment',
      reference,
      userId: req.user.id,
      notes,
      timestamp: new Date()
    });
    
    // Update stock quantity
    if (type === 'entry' || type === 'in') {
      stock.quantity += parseInt(quantity);
      stock.lastRestockDate = new Date();
    } else if (type === 'exit' || type === 'out') {
      stock.quantity -= parseInt(quantity);
    }
    
    await stock.save();
    
    // Fetch complete movement with related data
    const completeMovement = await StockMovement.findByPk(movement.id, {
      include: [
        {
          model: Stock,
          include: [{ model: Product }]
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: completeMovement
    });
  } catch (error) {
    logger.error('Error recording stock movement:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording stock movement',
      error: error.message
    });
  }
};

/**
 * Record stock movement
 * POST /api/v1/client-stock/movement
 */
exports.recordStockMovement = async (req, res) => {
  try {
    const { stockId, type, quantity, reason, reference, notes } = req.body;
    
    if (!stockId || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock ID, type, and quantity are required'
      });
    }
    
    const stock = await Stock.findByPk(stockId);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }
    
    // Create movement record
    const movement = await StockMovement.create({
      stockId,
      type,
      quantity: parseInt(quantity),
      reason: reason || 'Manual adjustment',
      reference,
      userId: req.user.id,
      notes,
      timestamp: new Date()
    });
    
    // Update stock quantity if needed
    if (type === 'in') {
      stock.quantity += parseInt(quantity);
      stock.lastRestockDate = new Date();
    } else if (type === 'out') {
      stock.quantity -= parseInt(quantity);
    }
    
    await stock.save();
    
    // Fetch complete movement with related data
    const completeMovement = await StockMovement.findByPk(movement.id, {
      include: [
        {
          model: Stock,
          include: [{ model: Product }]
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: completeMovement
    });
  } catch (error) {
    logger.error('Error recording stock movement:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording stock movement',
      error: error.message
    });
  }
};
