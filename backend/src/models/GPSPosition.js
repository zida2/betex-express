/**
 * GPSPosition Model
 * Represents driver GPS positions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GPSPosition = sequelize.define('GPSPosition', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  speed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  heading: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  altitude: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'gps_positions',
  timestamps: false,
  indexes: [
    { fields: ['driverId', 'timestamp'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = GPSPosition;
