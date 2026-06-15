/**
 * Migration Routes - Temporary for adding location token fields
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// POST /api/v1/migration/location-token
router.post('/location-token', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Add locationtoken column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationtoken VARCHAR(255)
    `);

    // Add locationtokencreatedat column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationtokencreatedat TIMESTAMP
    `);

    // Add locationsharedat column
    await sequelize.query(`
      ALTER TABLE delivery_requests 
      ADD COLUMN IF NOT EXISTS locationsharedat TIMESTAMP
    `);

    // Add index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_delivery_requests_location_token 
      ON delivery_requests(locationtoken)
    `);

    return res.status(200).json({
      success: true,
      message: 'Location token fields added successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

module.exports = router;
