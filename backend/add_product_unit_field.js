/**
 * Migration Script: Add unit field to products table
 * Run with: node add_product_unit_field.js
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function addUnitField() {
  try {
    console.log('🔄 Adding unit field to products table...');
    
    // Add unit column
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'units';
    `);
    
    console.log('✅ Unit field added successfully to products table');
    
    // Update existing products to have default unit
    const [results] = await sequelize.query(`
      UPDATE products 
      SET unit = 'units' 
      WHERE unit IS NULL;
    `);
    
    console.log(`✅ Updated ${results.rowCount || 0} existing products with default unit`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addUnitField();
