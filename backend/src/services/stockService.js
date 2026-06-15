/**
 * Stock Service
 * Business logic for inventory management
 */

const { Stock, Product, Zone, StockMovement, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const { Op } = require('sequelize');

/**
 * Get stock for a product in a zone
 */
const getStockByProductAndZone = async (productId, zoneId) => {
  const stock = await Stock.findOne({
    attributes: ['id', 'productId', 'zoneId', 'quantity', 'minimumQuantity', 'location', 'lastRestockDate', 'createdAt', 'updatedAt'],
    where: { productId, zoneId },
    include: [
      { model: Product, attributes: ['name', 'sku', 'price'] },
      { model: Zone, attributes: ['name'] }
    ]
  });

  if (!stock) {
    throw new AppError('Stock not found', 404, 'STOCK_NOT_FOUND');
  }

  return stock;
};

/**
 * Get all stocks for a zone
 */
const getStocksByZone = async (zoneId, filters = {}) => {
  const { page = 1, limit = 50, lowStockOnly = false } = filters;
  const offset = (page - 1) * limit;

  const where = { zoneId };
  if (lowStockOnly) {
    where.quantity = { [Op.lte]: sequelize.col('minimumQuantity') };
  }

  const { count, rows } = await Stock.findAndCountAll({
    attributes: ['id', 'productId', 'zoneId', 'quantity', 'minimumQuantity', 'location', 'lastRestockDate', 'createdAt', 'updatedAt'],
    where,
    include: [
      { model: Product, attributes: ['name', 'sku', 'price', 'category'] },
      { model: Zone, attributes: ['name'] }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['quantity', 'ASC']]
  });

  return {
    stocks: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

/**
 * Update stock quantity
 */
const updateStockQuantity = async (stockId, quantity, type = 'adjustment', reason = '', userId = null) => {
  const stock = await Stock.findByPk(stockId);

  if (!stock) {
    throw new AppError('Stock not found', 404, 'STOCK_NOT_FOUND');
  }

  const oldQuantity = stock.quantity;
  let newQuantity = oldQuantity;

  if (type === 'in') {
    newQuantity = oldQuantity + quantity;
  } else if (type === 'out') {
    if (oldQuantity < quantity) {
      throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }
    newQuantity = oldQuantity - quantity;
  } else if (type === 'adjustment') {
    newQuantity = quantity;
  }

  // Update stock
  await stock.update({
    quantity: newQuantity,
    lastRestockDate: type === 'in' ? new Date() : stock.lastRestockDate
  });

  // Record movement
  await StockMovement.create({
    stockId,
    type,
    quantity,
    reason,
    userId
  });

  return stock;
};

/**
 * Create stock entry
 */
const createStock = async (productId, zoneId, quantity = 0, minimumQuantity = 10) => {
  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Check if zone exists
  const zone = await Zone.findByPk(zoneId);
  if (!zone) {
    throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
  }

  // Check if stock already exists
  const existingStock = await Stock.findOne({
    where: { productId, zoneId }
  });

  if (existingStock) {
    throw new AppError('Stock already exists for this product in this zone', 400, 'STOCK_EXISTS');
  }

  const stock = await Stock.create({
    productId,
    zoneId,
    quantity,
    minimumQuantity
  });

  return stock;
};

/**
 * Get low stock alerts
 */
const getLowStockAlerts = async () => {
  const lowStocks = await Stock.findAll({
    attributes: ['id', 'productId', 'zoneId', 'quantity', 'minimumQuantity', 'location', 'lastRestockDate', 'createdAt', 'updatedAt'],
    where: {
      quantity: { [Op.lte]: sequelize.col('minimumQuantity') }
    },
    include: [
      { model: Product, attributes: ['name', 'sku'] },
      { model: Zone, attributes: ['name'] }
    ],
    order: [['quantity', 'ASC']]
  });

  return lowStocks;
};

/**
 * Get stock movement history
 */
const getStockMovementHistory = async (stockId, filters = {}) => {
  const { startDate, endDate, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  const where = { stockId };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp[Op.gte] = new Date(startDate);
    if (endDate) where.timestamp[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await StockMovement.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['timestamp', 'DESC']]
  });

  return {
    movements: rows,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

module.exports = {
  getStockByProductAndZone,
  getStocksByZone,
  updateStockQuantity,
  createStock,
  getLowStockAlerts,
  getStockMovementHistory
};
