/**
 * Package Model
 * Represents packages/parcels to be delivered
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Sender information
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  senderPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  senderAddress: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  senderLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  senderLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // Delivery information (renamed for clarity)
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Delivery address'
  },
  packageType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  packagePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  deliveryPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Pickup location
  pickupZoneId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Zone de récupération'
  },
  pickupAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Adresse de récupération'
  },
  pickupLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Latitude du point de récupération'
  },
  pickupLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Longitude du point de récupération'
  },
  // Delivery location
  deliveryZoneId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Zone de livraison'
  },
  deliveryAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Adresse de livraison'
  },
  deliveryLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Latitude du point de livraison'
  },
  deliveryLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Longitude du point de livraison'
  },
  // Distance and pricing
  distance: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Distance en km'
  },
  estimatedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Prix estimé'
  },
  routeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'collected', 'in_delivery', 'delivered', 'delivery_failed', 'cancelled'),
    defaultValue: 'pending'
  },
  deliveryPhase: {
    type: DataTypes.ENUM('morning_collection', 'evening_delivery'),
    allowNull: true,
    defaultValue: 'morning_collection'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSON,
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
  tableName: 'packages',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['pickupZoneId'] },
    { fields: ['deliveryZoneId'] },
    { fields: ['driverId'] },
    { fields: ['routeId'] },
    { fields: ['deliveryPhase'] }
  ]
});

module.exports = Package;
