/**
 * Expense Model
 * Tracks driver and administrative expenses
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'drivers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('driver', 'admin'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'fuel',           // Carburant
      'repair',         // Réparation moto
      'toll',           // Péage
      'communication',  // Communication
      'salary',         // Salaires
      'internet',       // Internet
      'electricity',    // Électricité
      'rent',           // Loyer
      'equipment',      // Achat de matériel
      'other'           // Autres
    ),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  photoUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Path to uploaded photo justification'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
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
  rejectionReason: {
    type: DataTypes.TEXT,
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
  tableName: 'expenses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['userId', 'date'] },
    { fields: ['type', 'status'] },
    { fields: ['category'] },
    { fields: ['date'] }
  ]
});

module.exports = Expense;
