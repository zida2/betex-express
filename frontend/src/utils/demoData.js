/**
 * Demo Data for Delivery Options Feature
 * Provides mock data for Express and Scheduled delivery modes
 * LOCATION: Ouagadougou, Burkina Faso
 */

// Demo drivers with real Ouagadougou coordinates
export const DEMO_EXPRESS_DRIVERS = [
  {
    id: 'driver-1',
    firstName: 'Amadou',
    lastName: 'Traore',
    cnib: '01234567',
    phone: '+226 70 50 50 50',
    email: 'amadou.traore@mail.com',
    vehicleType: 'Moto',
    vehiclePlate: 'BF-001-OUA',
    status: 'available',
    rating: 4.8,
    latitude: 12.3656,
    longitude: -1.5197,
    completedToday: 12,
    assignedPackages: 2
  },
  {
    id: 'driver-2',
    firstName: 'Fatoumata',
    lastName: 'Diallo',
    cnib: '02345678',
    phone: '+226 70 60 60 60',
    email: 'fatoumata.diallo@mail.com',
    vehicleType: 'Voiture',
    vehiclePlate: 'BF-002-OUA',
    status: 'available',
    rating: 4.6,
    latitude: 12.3700,
    longitude: -1.5250,
    completedToday: 18,
    assignedPackages: 1
  },
  {
    id: 'driver-3',
    firstName: 'Ibrahim',
    lastName: 'Sow',
    cnib: '03456789',
    phone: '+226 70 70 70 70',
    email: 'ibrahim.sow@mail.com',
    vehicleType: 'Moto',
    vehiclePlate: 'BF-003-OUA',
    status: 'available',
    rating: 4.7,
    latitude: 12.3550,
    longitude: -1.5150,
    completedToday: 15,
    assignedPackages: 3
  },
  {
    id: 'driver-4',
    firstName: 'Sophie',
    lastName: 'Sanou',
    cnib: '04567890',
    phone: '+226 70 80 80 80',
    email: 'sophie.sanou@mail.com',
    vehicleType: 'Voiture',
    vehiclePlate: 'BF-004-OUA',
    status: 'available',
    rating: 4.9,
    latitude: 12.3600,
    longitude: -1.5300,
    completedToday: 22,
    assignedPackages: 0
  }
];

// Ouagadougou zones with geographic bounds and pricing
export const DEMO_ZONES = [
  {
    id: 'zone-1',
    name: 'Zone Centre-Ville',
    description: 'Centre-ville, Plateau central',
    price: 1500,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Ouagadougou Centre, Plateau',
    bounds: {
      minLat: 12.35,
      maxLat: 12.38,
      minLng: -1.55,
      maxLng: -1.50
    }
  },
  {
    id: 'zone-2',
    name: 'Zone Secteur 1-2',
    description: 'Secteurs 1, 2, 3, 4',
    price: 1200,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Secteurs 1, 2, 3, 4',
    bounds: {
      minLat: 12.33,
      maxLat: 12.36,
      minLng: -1.58,
      maxLng: -1.52
    }
  },
  {
    id: 'zone-3',
    name: 'Zone Secteur 5-6',
    description: 'Secteurs 5, 6, 7',
    price: 1000,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Secteurs 5, 6, 7, Gounghin',
    bounds: {
      minLat: 12.30,
      maxLat: 12.35,
      minLng: -1.52,
      maxLng: -1.48
    }
  },
  {
    id: 'zone-4',
    name: 'Zone Nord',
    description: 'Secteur 9, 10, Kyassa',
    price: 2000,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Secteurs 9, 10, 11, Kyassa',
    bounds: {
      minLat: 12.39,
      maxLat: 12.43,
      minLng: -1.53,
      maxLng: -1.48
    }
  }
];

export const DEMO_TIME_SLOTS = [
  {
    id: 'slot-1',
    label: 'Créneau du matin',
    startTime: '09:00',
    endTime: '12:00',
    capacity: 50,
    booked: 42,
    available: true
  },
  {
    id: 'slot-2',
    label: 'Créneau de l\'après-midi',
    startTime: '14:00',
    endTime: '17:00',
    capacity: 50,
    booked: 38,
    available: true
  }
];

export const PRICING_CONFIG = {
  express: {
    basePrice: 500, // FCFA
    pricePerKm: 250 // FCFA per km
  },
  scheduled: {
    zones: {
      'zone-1': 1500, // Centre-Ville
      'zone-2': 1200, // Secteur 1-2
      'zone-3': 1000, // Secteur 5-6
      'zone-4': 2000  // Nord
    }
  }
};

/**
 * Haversine formula - Calculate distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate real distance from driver to pickup location
 * @param {Object} driver - Driver object with latitude, longitude
 * @param {Object} pickupLocation - Pickup location with latitude, longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceToDriver = (driver, pickupLocation) => {
  if (!driver || !pickupLocation || !pickupLocation.latitude || !pickupLocation.longitude) {
    return 0;
  }
  return haversineDistance(
    driver.latitude,
    driver.longitude,
    pickupLocation.latitude,
    pickupLocation.longitude
  );
};

/**
 * Calculate real distance between pickup and delivery
 * @param {Object} pickupLocation - Pickup location with latitude, longitude
 * @param {Object} deliveryLocation - Delivery location with latitude, longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDeliveryDistance = (pickupLocation, deliveryLocation) => {
  if (!pickupLocation || !deliveryLocation || 
      !pickupLocation.latitude || !pickupLocation.longitude ||
      !deliveryLocation.latitude || !deliveryLocation.longitude) {
    return 0;
  }
  return haversineDistance(
    pickupLocation.latitude,
    pickupLocation.longitude,
    deliveryLocation.latitude,
    deliveryLocation.longitude
  );
};

/**
 * Calculate distance-based pricing for Express delivery
 * @param {number} distance - Distance in kilometers
 * @returns {number} Calculated price in FCFA
 */
export const calculateExpressPrice = (distance) => {
  const { basePrice, pricePerKm } = PRICING_CONFIG.express;
  return Math.round(basePrice + (distance * pricePerKm));
};

/**
 * Determine zone based on coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} Zone object or null if outside bounds
 */
export const determineZoneByCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  
  const zone = DEMO_ZONES.find(zone => {
    const { minLat, maxLat, minLng, maxLng } = zone.bounds;
    return latitude >= minLat && latitude <= maxLat &&
           longitude >= minLng && longitude <= maxLng;
  });
  
  return zone || null; // Return null if outside all zones (not auto-default)
};

/**
 * Format pricing information for display
 * @param {string} option - 'express' or 'scheduled'
 * @param {Object} data - Additional pricing data
 * @returns {Object} Formatted pricing object
 */
export const formatPricingInfo = (option, data) => {
  if (option === 'express') {
    return {
      deliveryOption: 'express',
      pricingModel: 'distance_based',
      basePrice: data.basePrice || PRICING_CONFIG.express.basePrice,
      pricePerKm: data.pricePerKm || PRICING_CONFIG.express.pricePerKm,
      distance: data.distance,
      totalPrice: calculateExpressPrice(data.distance),
      driverId: data.driverId,
      driverName: data.driverName
    };
  } else if (option === 'scheduled') {
    return {
      deliveryOption: 'scheduled',
      pricingModel: 'zone_based',
      zone: data.zone,
      timeSlot: data.timeSlot,
      totalPrice: data.zone.price,
      deliveryDate: new Date().toLocaleDateString('fr-FR'),
      deliveryTimeRange: `${data.timeSlot.startTime} - ${data.timeSlot.endTime}`
    };
  }
  return null;
};
