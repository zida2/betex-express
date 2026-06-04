/**
 * Zone Model
 * Represents delivery zones/areas
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  boundaries: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'GeoJSON polygon for zone boundaries'
  },
  centerLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  centerLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'zones',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Zone;
