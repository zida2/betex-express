/**
 * Create DeliveryRequests table manually
 */

const { sequelize } = require('./src/config/database');

async function createDeliveryTable() {
  try {
    console.log('Creating delivery_requests table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS delivery_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "senderName" VARCHAR(100) NOT NULL,
        "senderPhone" VARCHAR(20) NOT NULL,
        "senderAddress" TEXT,
        "senderLat" FLOAT,
        "senderLng" FLOAT,
        "receiverName" VARCHAR(100) NOT NULL,
        "receiverPhone" VARCHAR(20) NOT NULL,
        "receiverAddress" TEXT,
        "receiverLat" FLOAT,
        "receiverLng" FLOAT,
        description TEXT,
        weight FLOAT,
        "packagePrice" DECIMAL(10, 2) DEFAULT 0,
        "deliveryPrice" DECIMAL(10, 2) DEFAULT 0,
        "adminNotes" TEXT,
        status VARCHAR(50) DEFAULT 'pending_approval' 
          CHECK (status IN ('pending_approval', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled')),
        "driverId" UUID REFERENCES drivers(id),
        "driverName" VARCHAR(100),
        "driverPhone" VARCHAR(20),
        "rejectionReason" TEXT,
        "clientMessage" TEXT,
        "messageType" VARCHAR(20) DEFAULT 'none' 
          CHECK ("messageType" IN ('whatsapp', 'sms', 'email', 'none')),
        "messageSentAt" TIMESTAMP,
        "approvedAt" TIMESTAMP,
        "rejectedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    await sequelize.query(createTableSQL);
    console.log('✓ delivery_requests table created successfully');

    // Insert some sample data
    const insertSampleSQL = `
      INSERT INTO delivery_requests (
        "senderName", "senderPhone", "senderAddress",
        "receiverName", "receiverPhone", "receiverAddress", 
        description, "deliveryPrice", status
      ) VALUES 
      ('Alice Martin', '+226 12 34 56 78', '123 Rue de la Paix, Ouagadougou', 
       'Bob Johnson', '+226 98 76 54 32', '456 Avenue de l''Indépendance, Bobo-Dioulasso',
       'Documents importants', 1500, 'completed'),
      ('Carol Smith', '+226 11 22 33 44', '789 Boulevard Kwame Nkrumah', 
       'David Brown', '+226 55 66 77 88', '321 Rue Maurice Bishop',
       'Colis fragile', 2500, 'approved'),
      ('Eve Wilson', '+226 99 88 77 66', 'Secteur 15, Ouaga 2000', 
       'Frank Davis', '+226 44 33 22 11', 'Zone du Bois, Ouagadougou',
       'Livraison express', 3000, 'in_transit')
      ON CONFLICT DO NOTHING;
    `;

    await sequelize.query(insertSampleSQL);
    console.log('✓ Sample delivery requests inserted');

    console.log('\n🎉 DeliveryRequests table setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createDeliveryTable();