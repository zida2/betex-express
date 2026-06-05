/**
 * Driver Statistics Service
 * Calculate and provide driver performance metrics
 */

const { Package, Driver, DeliveryHistory } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class DriverStatsService {
  /**
   * Get comprehensive driver statistics
   */
  static async getDriverStats(driverId) {
    try {
      const driver = await Driver.findByPk(driverId);
      if (!driver) {
        throw new Error('Driver not found');
      }

      // Total deliveries
      const totalDeliveries = await Package.count({
        where: {
          driverId: driverId,
          [Op.or]: [
            { status: 'delivered' },
            { status: 'delivery_failed' }
          ]
        }
      });

      // Successful deliveries
      const successfulDeliveries = await Package.count({
        where: {
          driverId: driverId,
          status: 'delivered'
        }
      });

      // Failed deliveries
      const failedDeliveries = await Package.count({
        where: {
          driverId: driverId,
          status: 'delivery_failed'
        }
      });

      // Today's deliveries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completedToday = await Package.count({
        where: {
          driverId: driverId,
          status: 'delivered',
          updatedAt: {
            [Op.gte]: today
          }
        }
      });

      // Calculate success rate
      const successRate = totalDeliveries > 0 
        ? (successfulDeliveries / totalDeliveries).toFixed(2)
        : 0;

      // Get average rating
      const avgRating = driver.rating || 0;

      // On-time rate (simplified - packages delivered)
      const onTimeDeliveries = deliveredCount;
      const onTimeRate = totalDeliveries > 0 
        ? Math.round((onTimeDeliveries / totalDeliveries) * 100)
        : 0;

      return {
        driverId,
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate: parseFloat(successRate),
        rating: parseFloat(avgRating),
        completedToday,
        onTimeRate,
        lastDelivery: driver.lastPositionUpdate,
        joinDate: driver.createdAt
      };
    } catch (error) {
      console.error('Error getting driver stats:', error);
      throw error;
    }
  }

  /**
   * Get driver delivery history
   */
  static async getDeliveryHistory(driverId, filters = {}) {
    try {
      const where = { driverId: driverId };

      // Filter by status
      if (filters.status) {
        where.status = filters.status;
      } else {
        // Default: only show completed deliveries
        where[Op.or] = [
          { status: 'delivered' },
          { status: 'delivery_failed' }
        ];
      }

      // Filter by date range
      if (filters.fromDate || filters.toDate) {
        where.createdAt = {};
        if (filters.fromDate) {
          where.createdAt[Op.gte] = new Date(filters.fromDate);
        }
        if (filters.toDate) {
          where.createdAt[Op.lte] = new Date(filters.toDate);
        }
      }

      const deliveries = await Package.findAll({
        where,
        order: [['updatedAt', 'DESC'], ['createdAt', 'DESC']],
        attributes: [
          'id',
          'customerName',
          'customerPhone',
          'senderName',
          'address',
          'weight',
          'status',
          'notes',
          'createdAt',
          'updatedAt'
        ]
      });

      return deliveries;
    } catch (error) {
      console.error('Error getting delivery history:', error);
      throw error;
    }
  }

  /**
   * Get driver workload
   */
  static async getDriversWorkload() {
    try {
      const drivers = await Driver.findAll({
        attributes: ['id', 'name', 'status', 'email']
      });

      const workloadData = await Promise.all(
        drivers.map(async (driver) => {
        const assignedPackages = await Package.count({
          where: {
            driverId: driver.id,
            [Op.or]: [
              { status: 'pending' },
              { status: 'collected' },
              { status: 'in_delivery' }
            ]
          }
        });

        const totalWeight = await Package.sum('weight', {
          where: {
            driverId: driver.id,
            [Op.or]: [
              { status: 'pending' },
              { status: 'collected' },
              { status: 'in_delivery' }
            ]
          }
        });

        const totalDeliveries = await Package.count({
          where: {
            driverId: driver.id,
            status: 'delivered'
          }
        });

        const failedDeliveries = await Package.count({
          where: {
            driverId: driver.id,
            status: 'delivery_failed'
          }
        });

          const successRate = (totalDeliveries + failedDeliveries) > 0
            ? totalDeliveries / (totalDeliveries + failedDeliveries)
            : 0;

          return {
            driverId: driver.id,
            driverName: driver.name,
            status: driver.status,
            assignedPackages,
            totalWeight: totalWeight || 0,
            successRate,
            totalDeliveries
          };
        })
      );

      return workloadData;
    } catch (error) {
      console.error('Error getting drivers workload:', error);
      throw error;
    }
  }

  /**
   * Update driver last activity
   */
  static async updateLastActivity(driverId) {
    try {
      await Driver.update(
        { lastActivityAt: new Date() },
        { where: { id: driverId } }
      );
    } catch (error) {
      console.error('Error updating driver last activity:', error);
    }
  }
}

module.exports = DriverStatsService;
