/**
 * Driver Model
 * Represents delivery drivers
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  vehiclePlate: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'in_delivery', 'offline'),
    defaultValue: 'offline'
  },
  currentZoneId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  totalDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0
  },
  lastLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Dernière latitude connue du livreur'
  },
  lastLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Dernière longitude connue du livreur'
  },
  lastPositionUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Horodatage de la dernière mise à jour de position'
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
  tableName: 'drivers',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['currentZoneId'] },
    { fields: ['userId'] }
  ]
});

module.exports = Driver;
