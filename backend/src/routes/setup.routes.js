/**
 * Setup Routes (temporary)
 * For database setup and testing
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

/**
 * POST /setup/create-delivery-table
 * Create delivery_requests table
 */
router.post('/create-delivery-table', async (req, res) => {
  try {
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

    // Insert sample data
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

    return res.status(200).json({
      success: true,
      message: 'DeliveryRequests table created and populated with sample data'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create table',
      error: error.message
    });
  }
});

/**
 * POST /setup/add-cnib-column
 * Add CNIB column to drivers table
 */
router.post('/add-cnib-column', async (req, res) => {
  try {
    // Add CNIB column if it doesn't exist
    const addColumnSQL = `
      ALTER TABLE drivers 
      ADD COLUMN IF NOT EXISTS cnib VARCHAR(50);
    `;

    await sequelize.query(addColumnSQL);

    return res.status(200).json({
      success: true,
      message: 'CNIB column added to drivers table successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add CNIB column',
      error: error.message
    });
  }
});

module.exports = router;