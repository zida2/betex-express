/**
 * Delivery Request Model
 * Represents client delivery requests that need admin approval
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryRequest = sequelize.define('DeliveryRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Sender Information
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },
  senderPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: true }
  },
  senderAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  senderLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  senderLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Receiver Information
  receiverName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },
  receiverPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: true }
  },
  receiverAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receiverLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  receiverLng: {
    type: DataTypes.FLOAT,
    allowNull: true
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
  packagePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // Admin Information (to be filled by admin before approval)
  deliveryPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Status & Assignment
  status: {
    type: DataTypes.ENUM('pending_approval', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled'),
    defaultValue: 'pending_approval',
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Drivers',
      key: 'id'
    }
  },
  driverName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  driverPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Rejection Information
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Communication
  clientMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message sent to client regarding their request'
  },
  messageType: {
    type: DataTypes.ENUM('whatsapp', 'sms', 'email', 'none'),
    defaultValue: 'none'
  },
  messageSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Timestamps
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectedAt: {
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
  timestamps: true,
  tableName: 'DeliveryRequests'
});

module.exports = DeliveryRequest;
