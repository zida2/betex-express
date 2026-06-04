/**
 * Distance Calculation Utilities
 * Calculate distance between GPS coordinates
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate delivery price based on distance
 * @param {number} distance - Distance in kilometers
 * @param {number} weight - Weight in kilograms
 * @returns {number} Price in currency units
 */
const calculatePrice = (distance, weight = 0) => {
  // Base price: 5 units
  let price = 5;
  
  // Distance pricing: 2 units per km
  price += distance * 2;
  
  // Weight pricing: 0.5 units per kg
  if (weight > 0) {
    price += weight * 0.5;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

module.exports = {
  calculateDistance,
  calculatePrice
};
