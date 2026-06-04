/**
 * Stock Controller
 * Handles inventory management requests
 */

const stockService = require('../services/stockService');
const logger = require('../utils/logger');

/**
 * Get stock by product and zone
 */
const getStock = async (req, res, next) => {
  try {
    const { productId, zoneId } = req.params;
    const stock = await stockService.getStockByProductAndZone(productId, zoneId);
    
    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stocks for a zone
 */
const getStocksByZone = async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      lowStockOnly: req.query.lowStockOnly === 'true'
    };

    const result = await stockService.getStocksByZone(zoneId, filters);
    
    res.status(200).json({
      success: true,
      data: result.stocks,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create stock entry
 */
const createStock = async (req, res, next) => {
  try {
    const { productId, zoneId, quantity, minimumQuantity } = req.body;
    const stock = await stockService.createStock(productId, zoneId, quantity, minimumQuantity);
    
    logger.info(`Stock created for product ${productId} in zone ${zoneId}`);
    
    res.status(201).json({
      success: true,
      message: 'Stock created successfully',
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update stock quantity
 */
const updateStockQuantity = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const { quantity, type, reason } = req.body;
    
    const stock = await stockService.updateStockQuantity(
      stockId,
      quantity,
      type,
      reason,
      req.user?.id
    );
    
    logger.info(`Stock ${stockId} updated: ${type} ${quantity}`);
    
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock alerts
 */
const getLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await stockService.getLowStockAlerts();
    
    res.status(200).json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock movement history
 */
const getStockMovementHistory = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await stockService.getStockMovementHistory(stockId, filters);
    
    res.status(200).json({
      success: true,
      data: result.movements,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStock,
  getStocksByZone,
  createStock,
  updateStockQuantity,
  getLowStockAlerts,
  getStockMovementHistory
};
