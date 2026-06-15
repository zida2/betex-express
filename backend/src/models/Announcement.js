/**
 * Announcement Model
 * Represents announcements sent by admins to clients
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('info', 'promo', 'warning', 'important'),
    allowNull: false,
    defaultValue: 'info'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sentBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  tableName: 'announcements',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['createdAt'] },
    { fields: ['sentBy'] }
  ]
});

module.exports = Announcement;
