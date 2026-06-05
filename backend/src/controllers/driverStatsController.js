/**
 * Driver Statistics Controller
 * Handle driver statistics and performance endpoints
 */

const driverStatsService = require('../services/driverStatsService');
const { Package, Driver } = require('../models');
const { Op } = require('sequelize');

class DriverStatsController {
  /**
   * Get driver statistics
   */
  static async getDriverStats(req, res) {
    try {
      const { driverId } = req.params;

      // Verify driver exists and user is authorized
      if (req.user.role === 'driver' && req.user.id != driverId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this driver stats'
        });
      }

      const stats = await driverStatsService.getDriverStats(driverId);

      res.json({
        success: true,
        data: stats,
        message: 'Driver statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting driver stats:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error retrieving driver statistics'
      });
    }
  }

  /**
   * Get driver delivery history
   */
  static async getDeliveryHistory(req, res) {
    try {
      const { driverId } = req.params;
      const { status, fromDate, toDate } = req.query;

      // Verify driver exists and user is authorized
      if (req.user.role === 'driver' && req.user.id != driverId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this driver history'
        });
      }

      const history = await driverStatsService.getDeliveryHistory(driverId, {
        status,
        fromDate,
        toDate
      });

      res.json({
        success: true,
        data: history,
        count: history.length,
        message: 'Delivery history retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting delivery history:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error retrieving delivery history'
      });
    }
  }

  /**
   * Get all drivers workload
   */
  static async getDriversWorkload(req, res) {
    try {
      const workload = await driverStatsService.getDriversWorkload();

      res.json({
        success: true,
        data: workload,
        count: workload.length,
        message: 'Drivers workload retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting drivers workload:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error retrieving drivers workload'
      });
    }
  }

  /**
   * Get specific package tracking for driver
   */
  static async getPackageTracking(req, res) {
    try {
      const { packageId } = req.params;

      const pkg = await Package.findByPk(packageId, {
        attributes: [
          'id',
          'customerName',
          'customerPhone',
          'senderName',
          'senderPhone',
          'senderAddress',
          'address',
          'deliveryLatitude',
          'deliveryLongitude',
          'weight',
          'status',
          'notes',
          'createdAt',
          'updatedAt'
        ]
      });

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      // Verify driver owns this package
      if (pkg.driverId != req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this package'
        });
      }

      res.json({
        success: true,
        data: pkg,
        message: 'Package tracking information retrieved'
      });
    } catch (error) {
      console.error('Error getting package tracking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error retrieving package tracking'
      });
    }
  }

  /**
   * Update package status (driver)
   */
  static async updatePackageStatus(req, res) {
    try {
      const { packageId } = req.params;
      const { status, notes, rating } = req.body;
      const driverId = req.user.id;

      const pkg = await Package.findByPk(packageId);

      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      // Verify driver owns this package
      if (pkg.driverId != driverId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this package'
        });
      }

      // Update package status
      const updateData = { status };

      if (notes) {
        updateData.notes = notes;
      }

      await pkg.update(updateData);

      // Update driver last activity
      await driverStatsService.updateLastActivity(driverId);

      res.json({
        success: true,
        data: pkg,
        message: `Package status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating package status:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error updating package status'
      });
    }
  }

  /**
   * Get driver map data (current position and assigned packages)
   */
  static async getDriverMapData(req, res) {
    try {
      const driverId = req.user.id;

      const driver = await Driver.findByPk(driverId, {
        attributes: ['id', 'name', 'status', 'lastLatitude', 'lastLongitude']
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      const activePackages = await Package.findAll({
        where: {
          driverId: driverId,
          [Op.or]: [
            { status: 'pending' },
            { status: 'collected' },
            { status: 'in_delivery' }
          ]
        },
        attributes: [
          'id',
          'customerName',
          'customerPhone',
          'address',
          'deliveryLatitude',
          'deliveryLongitude',
          'status',
          'pickupAddress'
        ]
      });

      res.json({
        success: true,
        data: {
          driver,
          activePackages
        },
        message: 'Driver map data retrieved'
      });
    } catch (error) {
      console.error('Error getting driver map data:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error retrieving map data'
      });
    }
  }
}

module.exports = DriverStatsController;
