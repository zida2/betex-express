/**
 * Client Storage Model
 * Represents storage service requests and status for clients
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientStorage = sequelize.define('ClientStorage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('requested', 'active', 'suspended', 'terminated'),
    allowNull: false,
    defaultValue: 'requested'
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
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
  tableName: 'client_storages',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['clientId'], unique: true },
    { fields: ['status'] }
  ]
});

module.exports = ClientStorage;
