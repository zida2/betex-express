/**
 * Migration script to add 'client' role to users table enum
 */

const { sequelize } = require('./src/config/database');

async function addClientRole() {
  console.log('Starting migration to add client role...');
  
  try {
    // Check current database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Add 'client' to the enum type
    // PostgreSQL doesn't allow direct ALTER TYPE, so we need to use ALTER TABLE
    await sequelize.query(`
      ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'client';
    `);
    
    console.log('✓ Successfully added "client" role to enum_users_role');
    
    // Verify the change
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
    
    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

addClientRole();
