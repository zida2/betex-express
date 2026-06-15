/**
 * Migration script to add location token fields
 */

const { sequelize } = require('./src/config/database');

async function migrate() {
  try {
    console.log('Starting migration: Adding location token fields...');

    // Add locationtoken column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationtoken VARCHAR(255)
    `);
    console.log('✅ Added locationtoken column');

    // Add locationtokencreatedat column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationtokencreatedat TIMESTAMP
    `);
    console.log('✅ Added locationtokencreatedat column');

    // Add locationsharedat column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationsharedat TIMESTAMP
    `);
    console.log('✅ Added locationsharedat column');

    // Add index for faster lookups
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_delivery_requests_location_token 
      ON delivery_requests(locationtoken)
    `);
    console.log('✅ Created index on locationtoken');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
