/**
 * Run Database Migration
 * Creates new tables for logistics platform features
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5433,
    database: process.env.DATABASE_NAME || 'betex_express',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres'
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📖 Reading migration script...');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'create_logistics_tables.sql'),
      'utf8'
    );

    console.log('🚀 Running migration...');
    await client.query(sqlScript);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 New tables created:');
    console.log('   ✓ client_storages');
    console.log('   ✓ expenses');
    console.log('   ✓ shipments');
    console.log('   ✓ scheduled_deliveries');
    console.log('   ✓ financial_records');
    console.log('\n📝 Modified tables:');
    console.log('   ✓ stocks (added client_id column)');
    
    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'client_storages', 
        'expenses', 
        'shipments', 
        'scheduled_deliveries', 
        'financial_records'
      )
      ORDER BY table_name;
    `);
    
    console.log(`\n✅ Found ${tableCheck.rows.length}/5 tables:`);
    tableCheck.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
};

// Run migration
console.log('='.repeat(60));
console.log('BETEX EXPRESS - Database Migration');
console.log('Logistics Platform Tables');
console.log('='.repeat(60));
console.log();

runMigration();
