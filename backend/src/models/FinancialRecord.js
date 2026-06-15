/**
 * Financial Record Model
 * Caches financial dashboard data for performance
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialRecord = sequelize.define('FinancialRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  period: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Start of period (day/month/year)'
  },
  periodType: {
    type: DataTypes.ENUM('daily', 'monthly', 'yearly'),
    allowNull: false
  },
  
  // Revenue breakdown
  deliveryRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Revenue from regular deliveries'
  },
  shipmentRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Revenue from shipments'
  },
  storageRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Revenue from storage services'
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // Expense breakdown
  driverExpenses: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total driver expenses (fuel, repair, etc.)'
  },
  adminExpenses: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total admin expenses (salary, rent, etc.)'
  },
  totalExpenses: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // Profit
  netProfit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total revenue minus total expenses'
  },
  profitMargin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Profit margin percentage'
  },
  
  // Additional metrics
  numberOfDeliveries: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  numberOfShipments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  activeClients: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'financial_records',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['period', 'periodType'], unique: true },
    { fields: ['period'] },
    { fields: ['periodType'] }
  ]
});

module.exports = FinancialRecord;
