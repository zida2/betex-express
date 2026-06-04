/**
 * Stock Model
 * Represents product inventory by zone
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  zoneId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minimumQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Physical location in warehouse'
  },
  lastRestockDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stocks',
  timestamps: true,
  indexes: [
    { fields: ['productId', 'zoneId'], unique: true },
    { fields: ['zoneId'] }
  ]
});

module.exports = Stock;
