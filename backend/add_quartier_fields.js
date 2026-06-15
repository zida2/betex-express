/**
 * Migration: Add quartier fields to delivery_requests table
 * Run with: node add_quartier_fields.js
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function addQuartierFields() {
  try {
    console.log('🔄 Adding quartier fields to delivery_requests table...');
    
    // Add sender quartier fields
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS "senderQuartier" VARCHAR(100);
    `);
    console.log('✅ Added senderQuartier column');
    
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS "senderZone" VARCHAR(100);
    `);
    console.log('✅ Added senderZone column');
    
    // Add receiver quartier fields
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS "receiverQuartier" VARCHAR(100);
    `);
    console.log('✅ Added receiverQuartier column');
    
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS "receiverZone" VARCHAR(100);
    `);
    console.log('✅ Added receiverZone column');
    
    // Add comments
    await sequelize.query(`
      COMMENT ON COLUMN delivery_requests."senderQuartier" IS 'Quartier automatiquement détecté du client';
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN delivery_requests."senderZone" IS 'Zone géographique du client (Centre, Nord, Sud, etc.)';
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN delivery_requests."receiverQuartier" IS 'Quartier automatiquement détecté du destinataire';
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN delivery_requests."receiverZone" IS 'Zone géographique du destinataire';
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Added senderQuartier field');
    console.log('  - Added senderZone field');
    console.log('  - Added receiverQuartier field');
    console.log('  - Added receiverZone field');
    console.log('\n🎯 Les demandes de livraison détecteront maintenant automatiquement les quartiers!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addQuartierFields();
