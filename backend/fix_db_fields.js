// Simple script to add missing fields to delivery_requests table
const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize(
  'betex_express',
  'postgres',
  'password',
  {
    host: 'localhost',
    port: 5434,
    dialect: 'postgres',
    logging: false
  }
);

async function addMissingFields() {
  try {
    console.log('🔧 Adding missing fields to delivery_requests table...');
    
    // Add locationtoken field
    try {
      await sequelize.query(`
        ALTER TABLE delivery_requests 
        ADD COLUMN locationtoken VARCHAR(255);
      `);
      console.log('✅ Added locationtoken field');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  locationtoken field already exists');
      } else {
        throw error;
      }
    }

    // Add locationtokencreatedat field
    try {
      await sequelize.query(`
        ALTER TABLE delivery_requests 
        ADD COLUMN locationtokencreatedat TIMESTAMP;
      `);
      console.log('✅ Added locationtokencreatedat field');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  locationtokencreatedat field already exists');
      } else {
        throw error;
      }
    }

    // Add locationsharedat field
    try {
      await sequelize.query(`
        ALTER TABLE delivery_requests 
        ADD COLUMN locationsharedat TIMESTAMP;
      `);
      console.log('✅ Added locationsharedat field');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  locationsharedat field already exists');
      } else {
        throw error;
      }
    }

    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addMissingFields();