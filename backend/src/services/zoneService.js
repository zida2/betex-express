/**
 * Zone Service
 * Business logic for zone management
 */

const { Zone, Package } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Create a new zone
 */
const createZone = async (zoneData) => {
  const { name, description, coordinates } = zoneData;

  const existingZone = await Zone.findOne({ where: { name } });
  if (existingZone) {
    throw new AppError('Zone with this name already exists', 400, 'ZONE_EXISTS');
  }

  const zone = await Zone.create({
    name,
    description,
    coordinates
  });

  return zone;
};

/**
 * Get all zones
 */
const getZones = async (filters = {}) => {
  const { page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await Zone.findAndCountAll({
    include: [
      {
        model: Package,
        attributes: ['id', 'status'],
        required: false
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['name', 'ASC']]
  });

  const zonesWithStats = rows.map(zone => {
    const packages = zone.Packages || [];
    return {
      ...zone.toJSON(),
      packageCount: packages.length,
      pendingPackages: packages.filter(p => p.status === 'pending').length
    };
  });

  return {
    zones: zonesWithStats,
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(count / limit)
  };
};

/**
 * Get zone by ID
 */
const getZoneById = async (zoneId) => {
  const zone = await Zone.findByPk(zoneId, {
    include: [
      {
        model: Package,
        attributes: ['id', 'customerName', 'customerPhone', 'address', 'status']
      }
    ]
  });

  if (!zone) {
    throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
  }

  return zone;
};

/**
 * Update zone
 */
const updateZone = async (zoneId, updateData) => {
  const zone = await Zone.findByPk(zoneId);

  if (!zone) {
    throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
  }

  if (updateData.name && updateData.name !== zone.name) {
    const existingZone = await Zone.findOne({ where: { name: updateData.name } });
    if (existingZone) {
      throw new AppError('Zone with this name already exists', 400, 'ZONE_EXISTS');
    }
  }

  await zone.update(updateData);
  return zone;
};

/**
 * Delete zone
 */
const deleteZone = async (zoneId) => {
  const zone = await Zone.findByPk(zoneId);

  if (!zone) {
    throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND');
  }

  const packageCount = await Package.count({ where: { zoneId } });
  if (packageCount > 0) {
    throw new AppError('Cannot delete zone with assigned packages', 400, 'ZONE_HAS_PACKAGES');
  }

  await zone.destroy();
  return true;
};

module.exports = {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone
};
