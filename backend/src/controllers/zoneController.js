/**
 * Zone Controller
 * Handles HTTP requests for zone management
 */

const zoneService = require('../services/zoneService');
const logger = require('../utils/logger');

/**
 * Create a new zone
 */
const createZone = async (req, res, next) => {
  try {
    const zone = await zoneService.createZone(req.body);
    logger.info(`Zone created: ${zone.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all zones
 */
const getZones = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await zoneService.getZones(filters);
    
    res.status(200).json({
      success: true,
      data: result.zones,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get zone by ID
 */
const getZoneById = async (req, res, next) => {
  try {
    const zone = await zoneService.getZoneById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update zone
 */
const updateZone = async (req, res, next) => {
  try {
    const zone = await zoneService.updateZone(req.params.id, req.body);
    logger.info(`Zone updated: ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Zone updated successfully',
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete zone
 */
const deleteZone = async (req, res, next) => {
  try {
    await zoneService.deleteZone(req.params.id);
    logger.info(`Zone deleted: ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone
};
