/**
 * Pricing Service
 * Handles price calculations for Express and Scheduled deliveries
 */

const logger = require('../utils/logger');

/**
 * Calculate Haversine distance between two coordinates
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
};

/**
 * Calculate Express delivery price based on distance
 * @param {number} distance - Distance in kilometers
 * @param {object} config - Pricing configuration
 * @returns {number} Price in FCFA
 */
const calculateExpressPrice = (distance, config = {}) => {
  const basePrice = config.basePrice || 500; // FCFA
  const pricePerKm = config.pricePerKm || 250; // FCFA per km
  const minPrice = config.minPrice || 500; // FCFA
  const maxPrice = config.maxPrice || 10000; // FCFA

  const calculatedPrice = basePrice + distance * pricePerKm;
  const finalPrice = Math.max(minPrice, Math.min(maxPrice, calculatedPrice));

  logger.info(`Express price calculation:
    Distance: ${distance}km
    Base: ${basePrice} + (${distance} × ${pricePerKm})
    Calculated: ${calculatedPrice}
    Final (clamped): ${finalPrice} FCFA`);

  return finalPrice;
};

/**
 * Calculate Scheduled delivery price based on zone
 * @param {number} latitude - Delivery latitude
 * @param {number} longitude - Delivery longitude
 * @param {array} zones - Array of available zones
 * @returns {object} { price, zoneId, zoneName } or error
 */
const calculateScheduledPrice = (latitude, longitude, zones) => {
  if (!zones || zones.length === 0) {
    throw new Error('No zones available for scheduled delivery');
  }

  // Find zone containing the coordinates
  for (const zone of zones) {
    if (
      latitude >= zone.minLatitude &&
      latitude <= zone.maxLatitude &&
      longitude >= zone.minLongitude &&
      longitude <= zone.maxLongitude
    ) {
      logger.info(`Zone found for coordinates (${latitude}, ${longitude}):
        Zone: ${zone.name}
        Price: ${zone.priceScheduled} FCFA`);

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        price: zone.priceScheduled,
        coverage: zone.coverageDescription,
        deliveryTimeMorning: zone.deliveryTimeMorning,
        deliveryTimeEvening: zone.deliveryTimeEvening
      };
    }
  }

  throw new Error(`No zone found for coordinates (${latitude}, ${longitude})`);
};

/**
 * Validate if coordinates fall within zone bounds
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {object} zone - Zone object
 * @returns {boolean} True if coordinates are in zone
 */
const isInZone = (latitude, longitude, zone) => {
  return (
    latitude >= zone.minLatitude &&
    latitude <= zone.maxLatitude &&
    longitude >= zone.minLongitude &&
    longitude <= zone.maxLongitude
  );
};

/**
 * Get all zones containing a coordinate
 * (useful for showing options to customer)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {array} zones - Array of zones
 * @returns {array} Matching zones
 */
const getZonesForLocation = (latitude, longitude, zones) => {
  return zones.filter(zone => isInZone(latitude, longitude, zone));
};

/**
 * Calculate delivery options for a location
 * Returns both Express and Scheduled options
 * @param {object} senderCoords - { lat, lng }
 * @param {object} receiverCoords - { lat, lng }
 * @param {array} zones - Available zones
 * @param {object} expressConfig - Express pricing config
 * @returns {object} { express, scheduled, distance }
 */
const calculateDeliveryOptions = (
  senderCoords,
  receiverCoords,
  zones,
  expressConfig = {}
) => {
  const distance = calculateDistance(
    senderCoords.lat,
    senderCoords.lng,
    receiverCoords.lat,
    receiverCoords.lng
  );

  const expressPrice = calculateExpressPrice(distance, expressConfig);

  let scheduledOption = null;
  try {
    scheduledOption = calculateScheduledPrice(
      receiverCoords.lat,
      receiverCoords.lng,
      zones
    );
  } catch (e) {
    logger.warn(`Scheduled delivery not available for location: ${e.message}`);
  }

  return {
    distance,
    express: {
      available: true,
      price: expressPrice,
      estimatedDelivery: '2-3 hours',
      formula: `500 + (${distance} × 250) = ${expressPrice} FCFA`
    },
    scheduled: scheduledOption || {
      available: false,
      reason: 'Location not in service zones'
    }
  };
};

module.exports = {
  calculateDistance,
  calculateExpressPrice,
  calculateScheduledPrice,
  isInZone,
  getZonesForLocation,
  calculateDeliveryOptions
};
