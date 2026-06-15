// Script to check the actual structure of delivery_requests table
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'betex_express',
  'postgres',
  'password',
  {
    host: 'localhost',
    port: 5434,
    dialect: 'postgres',
    logging: console.log
  }
);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking delivery_requests table structure...\n');
    
    // Get table columns
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'delivery_requests'
      ORDER BY column_name;
    `);
    
    console.log('📋 Table Columns:');
    results.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🧮 Row count:');
    const [countResult] = await sequelize.query(`SELECT COUNT(*) FROM delivery_requests;`);
    console.log(`  Total rows: ${countResult[0].count}`);
    
    // Sample any existing data
    console.log('\n📄 Sample data (first 3 rows):');
    const [sampleData] = await sequelize.query(`
      SELECT id, sendername, receivername, status, createdat 
      FROM delivery_requests 
      ORDER BY createdat DESC 
      LIMIT 3;
    `);
    
    if (sampleData.length > 0) {
      sampleData.forEach((row, idx) => {
        console.log(`  Row ${idx + 1}:`, row);
      });
    } else {
      console.log('  No data found');
    }
    
    console.log('\n✅ Check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();