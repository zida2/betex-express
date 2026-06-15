/**
 * Sync User model with database to update enum
 * This will alter the table to match the updated model definition
 */

const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function syncUserModel() {
  console.log('Starting User model sync...');
  
  try {
    // First, manually add the enum value (PostgreSQL specific)
    console.log('Adding "client" to enum_users_role...');
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'client' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_users_role')
          ) THEN
            EXECUTE 'ALTER TYPE enum_users_role ADD VALUE ''client''';
          END IF;
        END
        $$;
      `);
      console.log('✓ Successfully added "client" to enum_users_role');
    } catch (enumError) {
      console.log('Note: enum value may already exist or could not be added');
      console.log('Error:', enumError.message);
    }
    
    // Verify the enum values
    const [results] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'enum_users_role'
      )
      ORDER BY enumlabel;
    `);
    
    console.log('\n✓ Current role values in database:');
    results.forEach(row => console.log(`  - ${row.enumlabel}`));
    
    console.log('\n✓ Sync completed successfully!');
    console.log('\nYou can now restart the backend server to use the updated model.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Sync failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running on port 5434');
    console.error('2. Check database credentials in .env file');
    console.error('3. Verify database "betex_express" exists');
    process.exit(1);
  }
}

syncUserModel();
