/**
 * Optimization Service
 * Intelligent driver assignment and route optimization
 */

const { Driver, Package, Zone } = require('../models');
const { Op, sequelize } = require('sequelize');
const DistanceUtils = require('../utils/distance.utils');

class OptimizationService {
  /**
   * Suggest best driver for a package
   */
  static async suggestDriver(packageId, packageLocation = {}) {
    try {
      const pkg = await Package.findByPk(packageId);
      if (!pkg) {
        throw new Error('Package not found');
      }

      // Get all available drivers
      const availableDrivers = await Driver.findAll({
        where: {
          status: { [Op.in]: ['online', 'in_delivery', 'available'] }
        },
        attributes: ['id', 'name', 'status', 'lastLatitude', 'lastLongitude', 'rating', 'email']
      });

      if (availableDrivers.length === 0) {
        throw new Error('No available drivers');
      }

      // Score drivers based on multiple factors
      const scoredDrivers = await Promise.all(
        availableDrivers.map(async (driver) => {
          // Calculate distance from driver to package pickup location
          const distance = DistanceUtils.calculateDistance(
            driver.lastLatitude || 12.3714,
            driver.lastLongitude || -1.5197,
            pkg.pickupLatitude || 12.3650,
            pkg.pickupLongitude || -1.5250
          );

          // Get driver workload (active packages)
          const activePackages = await Package.count({
            where: {
              driverId: driver.id,
              status: { [Op.in]: ['pending', 'collected', 'in_delivery'] }
            }
          });

          // Get driver success rate
          const deliveredCount = await Package.count({
            where: {
              driverId: driver.id,
              status: 'delivered'
            }
          });

          const failedCount = await Package.count({
            where: {
              driverId: driver.id,
              status: 'delivery_failed'
            }
          });

          const totalDeliveries = deliveredCount + failedCount;
          const successRate = totalDeliveries > 0
            ? (deliveredCount / totalDeliveries) * 100
            : 100;

          // Calculate score (lower distance, lower workload, higher success rate)
          // Weight: 50% distance, 30% workload, 20% success rate
          const distanceScore = Math.max(0, 100 - (distance * 10)); // Max 100, decreases with distance
          const workloadScore = Math.max(0, 100 - (activePackages * 5)); // Max 100, decreases with workload
          const successScore = successRate; // 0-100

          const totalScore = (distanceScore * 0.5) + (workloadScore * 0.3) + (successScore * 0.2);

          return {
            id: driver.id,
            name: driver.name,
            status: driver.status,
            distance: parseFloat(distance.toFixed(2)),
            activePackages,
            successRate: parseFloat(successRate.toFixed(1)),
            rating: driver.rating,
            score: parseFloat(totalScore.toFixed(2))
          };
        })
      );

      // Sort by score (highest first)
      scoredDrivers.sort((a, b) => b.score - a.score);

      // Return top 3 suggestions
      return scoredDrivers.slice(0, 3);
    } catch (error) {
      console.error('Error suggesting driver:', error);
      throw error;
    }
  }

  /**
   * Assign package to driver
   */
  static async assignPackage(packageId, driverId) {
    try {
      const pkg = await Package.findByPk(packageId);
      const driver = await Driver.findByPk(driverId);

      if (!pkg || !driver) {
        throw new Error('Package or driver not found');
      }

      await pkg.update({
        driverId: driverId,
        status: 'pending'
      });

      return {
        packageId,
        driverId,
        trackingNumber: pkg.id,
        driverName: driver.name,
        message: 'Package assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning package:', error);
      throw error;
    }
  }

  /**
   * Assign multiple packages to drivers (batch optimization)
   */
  static async optimizePackageAssignment(packageIds, zoneId = null) {
    try {
      const packages = await Package.findAll({
        where: {
          id: { [Op.in]: packageIds },
          driverId: null
        }
      });

      if (packages.length === 0) {
        throw new Error('No unassigned packages found');
      }

      const assignedPackages = [];

      for (const pkg of packages) {
        // Get best driver suggestion
        const suggestions = await this.suggestDriver(pkg.id);
        if (suggestions.length > 0) {
          const bestDriver = suggestions[0];
          await this.assignPackage(pkg.id, bestDriver.id);
          assignedPackages.push({
            packageId: pkg.id,
            driverId: bestDriver.id,
            trackingNumber: pkg.id
          });
        }
      }

      return {
        assignedCount: assignedPackages.length,
        assignments: assignedPackages,
        message: `${assignedPackages.length} packages optimized and assigned`
      };
    } catch (error) {
      console.error('Error optimizing package assignment:', error);
      throw error;
    }
  }

  /**
   * Calculate optimal route for driver
   */
  static async calculateOptimalRoute(driverId) {
    try {
      const activePackages = await Package.findAll({
        where: {
          driverId: driverId,
          status: { [Op.in]: ['collected', 'in_delivery'] }
        },
        order: [['createdAt', 'ASC']]
      });

      if (activePackages.length === 0) {
        return {
          route: [],
          distance: 0,
          estimatedTime: 0
        };
      }

      // Simple sorting by distance (can be improved with TSP algorithm)
      const driver = await Driver.findByPk(driverId);
      let currentLat = driver.lastLatitude || 12.3714;
      let currentLng = driver.lastLongitude || -1.5197;
      let totalDistance = 0;
      const route = [];

      for (const pkg of activePackages) {
        const distance = DistanceUtils.calculateDistance(
          currentLat,
          currentLng,
          pkg.deliveryLatitude,
          pkg.deliveryLongitude
        );

        totalDistance += distance;
        route.push({
          packageId: pkg.id,
          trackingNumber: pkg.id,
          destination: pkg.address,
          distance: parseFloat(distance.toFixed(2))
        });

        currentLat = pkg.deliveryLatitude;
        currentLng = pkg.deliveryLongitude;
      }

      // Estimate time (average 15 min per delivery + 5 min per km travel)
      const estimatedTime = Math.round((activePackages.length * 15) + (totalDistance * 5));

      return {
        route,
        distance: parseFloat(totalDistance.toFixed(2)),
        estimatedTime,
        packageCount: activePackages.length
      };
    } catch (error) {
      console.error('Error calculating optimal route:', error);
      throw error;
    }
  }

  /**
   * Get optimization metrics
   */
  static async getOptimizationMetrics() {
    try {
      const totalPackages = await Package.count();
      const unassignedPackages = await Package.count({
        where: { driverId: null }
      });

      const assignedPackages = totalPackages - unassignedPackages;
      const activeDeliveries = await Package.count({
        where: {
          status: { [Op.in]: ['collected', 'in_delivery'] }
        }
      });

      const completedDeliveries = await Package.count({
        where: { status: 'delivered' }
      });

      const failedDeliveries = await Package.count({
        where: { status: 'delivery_failed' }
      });

      const successRate = (completedDeliveries + failedDeliveries) > 0
        ? (completedDeliveries / (completedDeliveries + failedDeliveries)) * 100
        : 0;

      return {
        totalPackages,
        assignedPackages,
        unassignedPackages,
        activeDeliveries,
        completedDeliveries,
        failedDeliveries,
        successRate: parseFloat(successRate.toFixed(1)),
        assignmentRate: totalPackages > 0 
          ? ((assignedPackages / totalPackages) * 100).toFixed(1)
          : 0
      };
    } catch (error) {
      console.error('Error getting optimization metrics:', error);
      throw error;
    }
  }
}

module.exports = OptimizationService;
