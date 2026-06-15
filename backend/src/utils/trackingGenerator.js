/**
 * Tracking Number Generator
 * Generates unique tracking numbers for shipments and scheduled deliveries
 */

/**
 * Generate tracking number with prefix and timestamp
 * @param {string} prefix - Prefix for tracking number (e.g., 'SHP' for shipment, 'SCH' for scheduled)
 * @returns {string} Generated tracking number
 */
const generateTrackingNumber = (prefix = 'BTX') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Generate shipment tracking number
 * @returns {string} Tracking number starting with SHP
 */
const generateShipmentTracking = () => {
  return generateTrackingNumber('SHP');
};

/**
 * Generate scheduled delivery tracking number
 * @returns {string} Tracking number starting with SCH
 */
const generateScheduledTracking = () => {
  return generateTrackingNumber('SCH');
};

/**
 * Generate delivery request tracking number
 * @returns {string} Tracking number starting with DEL
 */
const generateDeliveryTracking = () => {
  return generateTrackingNumber('DEL');
};

/**
 * Validate tracking number format
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} True if valid format
 */
const validateTrackingNumber = (trackingNumber) => {
  if (!trackingNumber || typeof trackingNumber !== 'string') {
    return false;
  }
  
  // Check if starts with valid prefix and has reasonable length
  const validPrefixes = ['SHP', 'SCH', 'DEL', 'BTX'];
  const hasValidPrefix = validPrefixes.some(prefix => trackingNumber.startsWith(prefix));
  const hasValidLength = trackingNumber.length >= 10 && trackingNumber.length <= 50;
  
  return hasValidPrefix && hasValidLength;
};

module.exports = {
  generateTrackingNumber,
  generateShipmentTracking,
  generateScheduledTracking,
  generateDeliveryTracking,
  validateTrackingNumber
};
