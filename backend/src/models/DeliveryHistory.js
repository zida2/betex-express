/**
 * DeliveryHistory Model
 * Represents delivery status history
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryHistory = sequelize.define('DeliveryHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  packageId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'collected', 'in_delivery', 'delivered', 'delivery_failed', 'cancelled'),
    allowNull: false
  },
  statusChangedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'delivery_history',
  timestamps: false,
  indexes: [
    { fields: ['packageId'] },
    { fields: ['driverId'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = DeliveryHistory;
