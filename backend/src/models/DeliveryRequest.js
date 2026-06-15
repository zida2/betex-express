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
  
  // Tracking
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: 'trackingnumber'
  },
  
  // Sender Information (database columns are camelCase)
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
  senderQuartier: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Quartier automatiquement détecté du client'
  },
  senderZone: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Zone géographique du client (Centre, Nord, Sud, etc.)'
  },
  
  // Receiver Information (database columns are camelCase)
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
  receiverQuartier: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Quartier automatiquement détecté du destinataire'
  },
  receiverZone: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Zone géographique du destinataire'
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
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'ispaid'
  },
  
  // Delivery Information
  deliveryType: {
    type: DataTypes.ENUM('express', 'scheduled'),
    allowNull: true,
    field: 'deliverytype'
  },
  distanceKm: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'distancekm'
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'scheduleddate'
  },
  timeSlot: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'timeslot'
  },
  zoneId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'zoneid'
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
      model: 'drivers',
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
  
  // Location Token for receiver sharing (database columns are lowercase)
  locationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'locationtoken'
  },
  locationTokenCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locationtokencreatedat'
  },
  locationSharedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locationsharedat'
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
  tableName: 'delivery_requests'
});

module.exports = DeliveryRequest;
