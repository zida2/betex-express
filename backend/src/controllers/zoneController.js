/**
 * Zone Controller
 * Handles zone management
 */

const { Zone } = require('../models');
const logger = require('../utils/logger');

/**
 * GET /zones
 * Get all zones
 */
const getZones = async (req, res) => {
  try {
    const { active } = req.query;

    let where = {};
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const zones = await Zone.findAll({
      where,
      order: [['name', 'ASC']]
    });

    const formattedZones = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      priceScheduled: zone.price_scheduled,
      bounds: {
        minLatitude: zone.min_latitude,
        maxLatitude: zone.max_latitude,
        minLongitude: zone.min_longitude,
        maxLongitude: zone.max_longitude
      },
      coverageDescription: zone.coverage_description,
      deliveryTimeMorning: zone.delivery_time_morning,
      deliveryTimeEvening: zone.delivery_time_evening,
      dailyCapacity: zone.daily_capacity,
      dailyBooked: zone.daily_booked,
      availableSlots: (zone.daily_capacity || 0) - (zone.daily_booked || 0),
      active: zone.active,
      createdAt: zone.created_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        zones: formattedZones,
        total: formattedZones.length
      }
    });
  } catch (error) {
    logger.error('Get zones error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get zones',
      error: error.message
    });
  }
};

/**
 * POST /zones
 * Create new zone (admin only)
 */
const createZone = async (req, res) => {
  try {
    const {
      name,
      description,
      priceScheduled,
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
      coverageDescription,
      dailyCapacity
    } = req.body;

    // Validate required fields
    if (!name || !priceScheduled) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    if (
      minLatitude === undefined ||
      maxLatitude === undefined ||
      minLongitude === undefined ||
      maxLongitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Geographic bounds are required'
      });
    }

    // Check if zone with this name already exists
    const existingZone = await Zone.findOne({ where: { name } });
    if (existingZone) {
      return res.status(409).json({
        success: false,
        message: 'Zone with this name already exists'
      });
    }

    // Create zone
    const zone = await Zone.create({
      name,
      description,
      price_scheduled: priceScheduled,
      min_latitude: minLatitude,
      max_latitude: maxLatitude,
      min_longitude: minLongitude,
      max_longitude: maxLongitude,
      coverage_description: coverageDescription,
      daily_capacity: dailyCapacity || 50,
      active: true
    });

    logger.info(`Zone created: ${name} (${priceScheduled} FCFA)`);

    return res.status(201).json({
      success: true,
      data: {
        id: zone.id,
        name: zone.name,
        priceScheduled: zone.price_scheduled,
        createdAt: zone.created_at
      }
    });
  } catch (error) {
    logger.error('Create zone error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create zone',
      error: error.message
    });
  }
};

/**
 * PUT /zones/:id
 * Update zone (admin only)
 */
const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      priceScheduled,
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
      dailyCapacity,
      active
    } = req.body;

    const zone = await Zone.findByPk(id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Update fields
    if (name) zone.name = name;
    if (description) zone.description = description;
    if (priceScheduled) zone.price_scheduled = priceScheduled;
    if (minLatitude !== undefined) zone.min_latitude = minLatitude;
    if (maxLatitude !== undefined) zone.max_latitude = maxLatitude;
    if (minLongitude !== undefined) zone.min_longitude = minLongitude;
    if (maxLongitude !== undefined) zone.max_longitude = maxLongitude;
    if (dailyCapacity) zone.daily_capacity = dailyCapacity;
    if (active !== undefined) zone.active = active;

    await zone.save();

    logger.info(`Zone updated: ${zone.name}`);

    return res.status(200).json({
      success: true,
      data: {
        id: zone.id,
        name: zone.name,
        priceScheduled: zone.price_scheduled,
        active: zone.active,
        updatedAt: zone.updated_at
      }
    });
  } catch (error) {
    logger.error('Update zone error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update zone',
      error: error.message
    });
  }
};

/**
 * DELETE /zones/:id
 * Delete zone (admin only)
 */
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await Zone.findByPk(id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const zoneName = zone.name;
    await zone.destroy();

    logger.info(`Zone deleted: ${zoneName}`);

    return res.status(200).json({
      success: true,
      message: `Zone ${zoneName} deleted successfully`
    });
  } catch (error) {
    logger.error('Delete zone error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete zone',
      error: error.message
    });
  }
};

module.exports = {
  getZones,
  createZone,
  updateZone,
  deleteZone
};
