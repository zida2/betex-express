/**
 * Shipment Model
 * Represents national/international shipment requests
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
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
  
  // Recipient Information
  recipientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  recipientPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  destinationAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  destinationLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  destinationLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  
  // Package Information
  packageDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Nature du colis'
  },
  packageValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valeur du colis',
    validate: {
      min: 0
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Weight in kg'
  },
  
  // Pricing (Admin fills these)
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Montant expédition fixé par admin'
  },
  additionalFees: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Frais supplémentaires'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // Status & Workflow
  status: {
    type: DataTypes.ENUM(
      'pending_pricing',   // En attente de tarification
      'awaiting_payment',  // En attente du paiement
      'paid',              // Payé
      'processing',        // En traitement
      'in_transit',        // En transit
      'delivered',         // Livré
      'cancelled'          // Annulé
    ),
    allowNull: false,
    defaultValue: 'pending_pricing'
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
    allowNull: false,
    defaultValue: 'unpaid'
  },
  
  // Admin fields
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pricedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  pricedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['trackingNumber'], unique: true },
    { fields: ['clientId', 'status'] },
    { fields: ['status', 'paymentStatus'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Shipment;
