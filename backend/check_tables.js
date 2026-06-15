/**
 * Check existing tables in database
 */

const { sequelize } = require('./src/config/database');

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Test connection first
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Check what tables exist
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Existing tables:');
    if (results.length === 0) {
      console.log('  No tables found');
    } else {
      results.forEach(row => console.log(`  - ${row.table_name}`));
    }

    console.log('\n🔍 Check if users table has data:');
    try {
      const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`  Users count: ${userCount[0].count}`);
    } catch (err) {
      console.log(`  Error checking users: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();