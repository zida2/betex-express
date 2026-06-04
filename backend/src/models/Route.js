/**
 * Route Model
 * Represents delivery routes
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  phase: {
    type: DataTypes.ENUM('morning_collection', 'evening_delivery'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalPackages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedPackages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedPackages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
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
  tableName: 'routes',
  timestamps: true,
  indexes: [
    { fields: ['driverId'] },
    { fields: ['phase'] },
    { fields: ['status'] }
  ]
});

module.exports = Route;
