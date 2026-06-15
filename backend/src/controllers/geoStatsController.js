/**
 * Geographic Statistics Controller
 * Provides geographical analytics for delivery requests by quartiers
 */

const { DeliveryRequest, User } = require('../models');
const { determinerQuartier, getZones, OUAGA_QUARTIERS } = require('../utils/ouagaQuartiers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /geo-stats/quartiers
 * Get delivery statistics by quartiers
 */
exports.getQuartierStats = async (req, res) => {
  try {
    const { zone, period = '30' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    let whereClause = {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    };

    // Filter by zone if specified
    if (zone && zone !== 'all') {
      whereClause[Op.or] = [
        { senderZone: zone },
        { receiverZone: zone }
      ];
    }

    // Get all delivery requests with quartier info
    const requests = await DeliveryRequest.findAll({
      where: whereClause,
      attributes: [
        'id', 'senderQuartier', 'senderZone', 'receiverQuartier', 'receiverZone',
        'status', 'deliveryType', 'deliveryPrice', 'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Process statistics
    const quartierStats = {};
    const zoneStats = {};
    const dailyStats = {};

    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      dailyStats[date].revenue += parseFloat(req.deliveryPrice || 0);

      // Process sender quartier
      if (req.senderQuartier) {
        if (!quartierStats[req.senderQuartier]) {
          quartierStats[req.senderQuartier] = {
            nom: req.senderQuartier,
            zone: req.senderZone,
            expediteurs: 0,
            destinataires: 0,
            total: 0,
            revenue: 0,
            statusBreakdown: {
              pending_approval: 0,
              approved: 0,
              in_transit: 0,
              completed: 0,
              rejected: 0
            },
            typeBreakdown: {
              express: 0,
              scheduled: 0
            }
          };
        }
        quartierStats[req.senderQuartier].expediteurs++;
        quartierStats[req.senderQuartier].total++;
        quartierStats[req.senderQuartier].revenue += parseFloat(req.deliveryPrice || 0);
        quartierStats[req.senderQuartier].statusBreakdown[req.status]++;
        quartierStats[req.senderQuartier].typeBreakdown[req.deliveryType]++;
      }

      // Process receiver quartier
      if (req.receiverQuartier && req.receiverQuartier !== req.senderQuartier) {
        if (!quartierStats[req.receiverQuartier]) {
          quartierStats[req.receiverQuartier] = {
            nom: req.receiverQuartier,
            zone: req.receiverZone,
            expediteurs: 0,
            destinataires: 0,
            total: 0,
            revenue: 0,
            statusBreakdown: {
              pending_approval: 0,
              approved: 0,
              in_transit: 0,
              completed: 0,
              rejected: 0
            },
            typeBreakdown: {
              express: 0,
              scheduled: 0
            }
          };
        }
        quartierStats[req.receiverQuartier].destinataires++;
        quartierStats[req.receiverQuartier].total++;
        quartierStats[req.receiverQuartier].revenue += parseFloat(req.deliveryPrice || 0);
        quartierStats[req.receiverQuartier].statusBreakdown[req.status]++;
        quartierStats[req.receiverQuartier].typeBreakdown[req.deliveryType]++;
      }

      // Zone stats
      if (req.senderZone) {
        zoneStats[req.senderZone] = (zoneStats[req.senderZone] || 0) + 1;
      }
      if (req.receiverZone && req.receiverZone !== req.senderZone) {
        zoneStats[req.receiverZone] = (zoneStats[req.receiverZone] || 0) + 1;
      }
    });

    // Sort quartiers by activity
    const topQuartiers = Object.values(quartierStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    // Calculate completion rate per quartier
    topQuartiers.forEach(quartier => {
      const completed = quartier.statusBreakdown.completed;
      const total = quartier.total;
      quartier.completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    res.json({
      success: true,
      data: {
        quartiers: topQuartiers,
        zones: zoneStats,
        dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => a.date.localeCompare(b.date)),
        summary: {
          totalRequests: requests.length,
          totalRevenue: requests.reduce((sum, req) => sum + parseFloat(req.deliveryPrice || 0), 0),
          activeQuartiers: Object.keys(quartierStats).length,
          avgRequestsPerQuartier: Object.keys(quartierStats).length > 0 
            ? Math.round(requests.length / Object.keys(quartierStats).length) 
            : 0
        }
      }
    });

  } catch (error) {
    logger.error('Error getting quartier stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quartier statistics',
      error: error.message
    });
  }
};

/**
 * GET /geo-stats/heatmap
 * Get heatmap data for geographic visualization
 */
exports.getHeatmapData = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const requests = await DeliveryRequest.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        [Op.or]: [
          { senderLat: { [Op.not]: null } },
          { receiverLat: { [Op.not]: null } }
        ]
      },
      attributes: [
        'senderLat', 'senderLng', 'senderQuartier', 'senderZone',
        'receiverLat', 'receiverLng', 'receiverQuartier', 'receiverZone',
        'status', 'deliveryPrice', 'createdAt'
      ]
    });

    const heatmapPoints = [];

    requests.forEach(req => {
      // Add sender point
      if (req.senderLat && req.senderLng) {
        heatmapPoints.push({
          lat: req.senderLat,
          lng: req.senderLng,
          quartier: req.senderQuartier,
          zone: req.senderZone,
          type: 'sender',
          weight: 1
        });
      }

      // Add receiver point
      if (req.receiverLat && req.receiverLng) {
        heatmapPoints.push({
          lat: req.receiverLat,
          lng: req.receiverLng,
          quartier: req.receiverQuartier,
          zone: req.receiverZone,
          type: 'receiver',
          weight: 1
        });
      }
    });

    // Group by quartier for aggregated view
    const quartierHeatmap = {};
    OUAGA_QUARTIERS.forEach(quartier => {
      const points = heatmapPoints.filter(p => p.quartier === quartier.nom);
      if (points.length > 0) {
        quartierHeatmap[quartier.nom] = {
          lat: quartier.coordonnees.lat,
          lng: quartier.coordonnees.lng,
          nom: quartier.nom,
          zone: quartier.zone,
          intensity: points.length,
          senders: points.filter(p => p.type === 'sender').length,
          receivers: points.filter(p => p.type === 'receiver').length
        };
      }
    });

    res.json({
      success: true,
      data: {
        points: heatmapPoints,
        quartierCenters: Object.values(quartierHeatmap),
        summary: {
          totalPoints: heatmapPoints.length,
          activeQuartiers: Object.keys(quartierHeatmap).length,
          period: parseInt(period)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting heatmap data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching heatmap data',
      error: error.message
    });
  }
};

/**
 * GET /geo-stats/routes
 * Get most popular delivery routes between quartiers
 */
exports.getPopularRoutes = async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const requests = await DeliveryRequest.findAll({
      where: {
        senderQuartier: { [Op.not]: null },
        receiverQuartier: { [Op.not]: null },
        status: { [Op.in]: ['approved', 'in_transit', 'completed'] }
      },
      attributes: [
        'senderQuartier', 'senderZone', 'receiverQuartier', 'receiverZone',
        'deliveryPrice', 'deliveryType', 'status', 'createdAt'
      ]
    });

    const routes = {};

    requests.forEach(req => {
      if (req.senderQuartier !== req.receiverQuartier) {
        const routeKey = `${req.senderQuartier} → ${req.receiverQuartier}`;
        
        if (!routes[routeKey]) {
          routes[routeKey] = {
            from: req.senderQuartier,
            fromZone: req.senderZone,
            to: req.receiverQuartier,
            toZone: req.receiverZone,
            count: 0,
            totalRevenue: 0,
            avgPrice: 0,
            types: { express: 0, scheduled: 0 }
          };
        }

        routes[routeKey].count++;
        routes[routeKey].totalRevenue += parseFloat(req.deliveryPrice || 0);
        routes[routeKey].types[req.deliveryType]++;
      }
    });

    // Calculate averages and sort by popularity
    const popularRoutes = Object.values(routes)
      .map(route => ({
        ...route,
        avgPrice: route.count > 0 ? Math.round(route.totalRevenue / route.count) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        routes: popularRoutes,
        summary: {
          totalUniqueRoutes: Object.keys(routes).length,
          totalTrips: requests.length,
          interQuartierOnly: true
        }
      }
    });

  } catch (error) {
    logger.error('Error getting popular routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular routes',
      error: error.message
    });
  }
};

/**
 * POST /geo-stats/detect-quartier
 * Detect quartier from coordinates (utility endpoint)
 */
exports.detectQuartier = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const quartierInfo = determinerQuartier(latitude, longitude);

    res.json({
      success: true,
      data: {
        quartier: quartierInfo,
        coordinates: { latitude, longitude }
      }
    });

  } catch (error) {
    logger.error('Error detecting quartier:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting quartier',
      error: error.message
    });
  }
};