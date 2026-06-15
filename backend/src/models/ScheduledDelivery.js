/**
 * Scheduled Delivery Model
 * Represents deliveries scheduled for future dates/times
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScheduledDelivery = sequelize.define('ScheduledDelivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  
  // Pickup Information
  pickupAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pickupLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  pickupLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Delivery Information
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  deliveryLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  deliveryLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Scheduling
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduledTimeSlot: {
    type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'specific'),
    allowNull: false,
    defaultValue: 'morning'
  },
  specificTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  
  // Delivery Type
  deliveryType: {
    type: DataTypes.ENUM('local', 'express'),
    allowNull: false,
    defaultValue: 'local'
  },
  
  // Package Information
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Pricing
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // Recurring (future enhancement)
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrencePattern: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'JSON string for recurrence pattern'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM(
      'pending_approval',
      'approved',
      'scheduled',
      'in_progress',
      'completed',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'pending_approval'
  },
  
  // Driver assignment
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'drivers',
      key: 'id'
    }
  },
  
  // Admin fields
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'scheduled_deliveries',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['trackingNumber'], unique: true },
    { fields: ['clientId', 'status'] },
    { fields: ['scheduledDate', 'status'] },
    { fields: ['driverId'] }
  ]
});

module.exports = ScheduledDelivery;
