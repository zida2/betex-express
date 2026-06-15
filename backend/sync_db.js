/**
 * Database Sync Script
 * Creates all tables from Sequelize models
 */

require('dotenv').config();
const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync all models (create tables) - force true to reset for first time
    await sequelize.sync({ force: true });
    console.log('✓ All tables synchronized successfully');

    // List all tables
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('\n📋 Existing tables:');
    tables.forEach(table => console.log(`  - ${table}`));

    console.log('\n🎉 Database sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Database sync failed:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();