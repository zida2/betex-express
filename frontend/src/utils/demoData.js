/**
 * Demo Data for Delivery Options Feature
 * Provides mock data for Express and Scheduled delivery modes
 */

export const DEMO_EXPRESS_DRIVERS = [
  {
    id: 'driver-1',
    firstName: 'Jean',
    lastName: 'Kouame',
    cnib: '01234567',
    phone: '+225 07 55 55 55 55',
    email: 'jean.kouame@mail.com',
    vehicleType: 'Moto',
    vehiclePlate: 'AB-123-CD',
    status: 'available',
    rating: 4.8,
    distance: 2.5,
    latitude: 6.8276,
    longitude: -5.2893,
    completedToday: 12,
    assignedPackages: 2
  },
  {
    id: 'driver-2',
    firstName: 'Marie',
    lastName: 'Diallo',
    cnib: '02345678',
    phone: '+225 01 66 66 66 66',
    email: 'marie.diallo@mail.com',
    vehicleType: 'Voiture',
    vehiclePlate: 'EF-456-GH',
    status: 'available',
    rating: 4.6,
    distance: 3.1,
    latitude: 6.8250,
    longitude: -5.2850,
    completedToday: 18,
    assignedPackages: 1
  },
  {
    id: 'driver-3',
    firstName: 'Ahmed',
    lastName: 'Ibrahim',
    cnib: '03456789',
    phone: '+225 05 77 77 77 77',
    email: 'ahmed.ibrahim@mail.com',
    vehicleType: 'Moto',
    vehiclePlate: 'IJ-789-KL',
    status: 'available',
    rating: 4.7,
    distance: 1.8,
    latitude: 6.8300,
    longitude: -5.2900,
    completedToday: 15,
    assignedPackages: 3
  },
  {
    id: 'driver-4',
    firstName: 'Sophie',
    lastName: 'Blanc',
    cnib: '04567890',
    phone: '+225 09 88 88 88 88',
    email: 'sophie.blanc@mail.com',
    vehicleType: 'Voiture',
    vehiclePlate: 'MN-012-OP',
    status: 'available',
    rating: 4.9,
    distance: 4.2,
    latitude: 6.8200,
    longitude: -5.2800,
    completedToday: 22,
    assignedPackages: 0
  }
];

export const DEMO_ZONES = [
  {
    id: 'zone-1',
    name: 'Zone Plateau',
    description: 'Centre-ville, Plateau',
    price: 1500,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Abidjan Centre',
    bounds: {
      minLat: 6.82,
      maxLat: 6.84,
      minLng: -5.30,
      maxLng: -5.27
    }
  },
  {
    id: 'zone-2',
    name: 'Zone Treichville',
    description: 'Treichville, Adjamé',
    price: 1200,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Treichville, Adjamé, Marcory',
    bounds: {
      minLat: 6.81,
      maxLat: 6.83,
      minLng: -5.32,
      maxLng: -5.28
    }
  },
  {
    id: 'zone-3',
    name: 'Zone Yopougon',
    description: 'Yopougon, Abobo',
    price: 1000,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Yopougon, Abobo, Songon',
    bounds: {
      minLat: 6.79,
      maxLat: 6.82,
      minLng: -5.35,
      maxLng: -5.31
    }
  },
  {
    id: 'zone-4',
    name: 'Zone Cocody',
    description: 'Cocody, Deux-Plateaux',
    price: 2000,
    deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
    coverage: 'Cocody, Deux-Plateaux, Bingerville',
    bounds: {
      minLat: 6.84,
      maxLat: 6.86,
      minLng: -5.25,
      maxLng: -5.22
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
      'zone-1': 1500, // Plateau
      'zone-2': 1200, // Treichville
      'zone-3': 1000, // Yopougon
      'zone-4': 2000  // Cocody
    }
  }
};

/**
 * Calculate distance-based pricing for Express delivery
 * @param {number} distance - Distance in kilometers
 * @returns {number} Calculated price in FCFA
 */
export const calculateExpressPrice = (distance) => {
  const { basePrice, pricePerKm } = PRICING_CONFIG.express;
  return basePrice + (distance * pricePerKm);
};

/**
 * Determine zone based on coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} Zone object or null if outside bounds
 */
export const determineZoneByCoordinates = (latitude, longitude) => {
  return DEMO_ZONES.find(zone => {
    const { minLat, maxLat, minLng, maxLng } = zone.bounds;
    return latitude >= minLat && latitude <= maxLat &&
           longitude >= minLng && longitude <= maxLng;
  }) || DEMO_ZONES[0]; // Default to first zone if not found
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
