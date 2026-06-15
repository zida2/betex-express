/**
 * Database Configuration
 * PostgreSQL connection setup
 * Updated to use 127.0.0.1 for IPv4
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Use DATABASE_URL if available, otherwise use individual parameters
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  `postgres://${process.env.DATABASE_USER || 'postgres'}:${process.env.DATABASE_PASSWORD || 'postgres'}@${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || 5432}/${process.env.DATABASE_NAME || 'betex_express'}`,
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DATABASE_POOL_MAX) || 10,
      min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,
      timeout: 5000
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection successful');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
};
