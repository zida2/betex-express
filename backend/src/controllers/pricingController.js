/**
 * Pricing Controller
 * Handles pricing configuration and calculations
 */

const { PricingConfig, Zone } = require('../models');
const pricingService = require('../services/pricingService');
const logger = require('../utils/logger');

/**
 * GET /pricing
 * Get pricing configuration
 */
const getPricing = async (req, res) => {
  try {
    const expressConfig = await PricingConfig.findOne({
      where: { delivery_type: 'express' }
    });

    const scheduledConfig = await PricingConfig.findOne({
      where: { delivery_type: 'scheduled' }
    });

    const zones = await Zone.findAll({ where: { active: true } });

    return res.status(200).json({
      success: true,
      data: {
        express: {
          basePrice: expressConfig?.express_base_price || 500,
          pricePerKm: expressConfig?.express_price_per_km || 250,
          minPrice: expressConfig?.express_min_price || 500,
          maxPrice: expressConfig?.express_max_price || 10000,
          formula: 'base + (distance × perKm)',
          example: `500 + (5 × 250) = 1,750 FCFA`
        },
        scheduled: {
          zones: zones.map(zone => ({
            id: zone.id,
            name: zone.name,
            price: zone.price_scheduled,
            coverage: zone.coverage_description,
            dailyCapacity: zone.daily_capacity,
            dailyBooked: zone.daily_booked,
            availableSlots:
              (zone.daily_capacity || 0) - (zone.daily_booked || 0)
          }))
        }
      }
    });
  } catch (error) {
    logger.error('Get pricing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pricing',
      error: error.message
    });
  }
};

/**
 * PUT /pricing
 * Update pricing configuration (admin only)
 */
const updatePricing = async (req, res) => {
  try {
    const {
      express: {
        basePrice,
        pricePerKm,
        minPrice,
        maxPrice
      } = {}
    } = req.body;

    if (!basePrice || !pricePerKm || !minPrice || !maxPrice) {
      return res.status(400).json({
        success: false,
        message: 'All express pricing fields are required'
      });
    }

    // Find or create express pricing config
    let expressConfig = await PricingConfig.findOne({
      where: { delivery_type: 'express' }
    });

    if (expressConfig) {
      expressConfig.express_base_price = basePrice;
      expressConfig.express_price_per_km = pricePerKm;
      expressConfig.express_min_price = minPrice;
      expressConfig.express_max_price = maxPrice;
      await expressConfig.save();
    } else {
      expressConfig = await PricingConfig.create({
        delivery_type: 'express',
        express_base_price: basePrice,
        express_price_per_km: pricePerKm,
        express_min_price: minPrice,
        express_max_price: maxPrice,
        active: true
      });
    }

    logger.info(
      `Pricing updated: Base=${basePrice}, PerKm=${pricePerKm}, Min=${minPrice}, Max=${maxPrice}`
    );

    return res.status(200).json({
      success: true,
      message: 'Pricing updated successfully',
      data: {
        express: {
          basePrice: expressConfig.express_base_price,
          pricePerKm: expressConfig.express_price_per_km,
          minPrice: expressConfig.express_min_price,
          maxPrice: expressConfig.express_max_price
        }
      }
    });
  } catch (error) {
    logger.error('Update pricing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update pricing',
      error: error.message
    });
  }
};

/**
 * POST /pricing/calculate-express
 * Calculate express delivery price (helper endpoint)
 */
const calculateExpressPrice = async (req, res) => {
  try {
    const { distance } = req.body;

    if (!distance || distance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid distance is required'
      });
    }

    const pricingConfig = {
      basePrice: 500,
      pricePerKm: 250,
      minPrice: 500,
      maxPrice: 10000
    };

    const price = pricingService.calculateExpressPrice(distance, pricingConfig);

    return res.status(200).json({
      success: true,
      data: {
        distance,
        basePrice: 500,
        pricePerKm: 250,
        calculatedPrice: price,
        formula: `500 + (${distance} × 250) = ${price} FCFA`
      }
    });
  } catch (error) {
    logger.error('Calculate express price error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate price',
      error: error.message
    });
  }
};

module.exports = {
  getPricing,
  updatePricing,
  calculateExpressPrice
};
