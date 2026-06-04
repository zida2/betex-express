/**
 * Mock Data pour démonstration sans backend
 */

export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Utilisateurs de démo
export const DEMO_USERS = {
  admin: {
    id: 1,
    email: 'admin@betex.com',
    password: 'admin123',
    name: 'Administrateur BETEX',
    role: 'admin',
    token: 'demo_admin_token_123456789'
  },
  livreur: {
    id: 2,
    email: 'livreur@betex.com',
    password: 'livreur123',
    name: 'Jean Kouassi',
    role: 'driver',
    token: 'demo_driver_token_987654321'
  }
};

// Statistiques du dashboard
export const DEMO_STATS = {
  totalPackages: 156,
  totalDrivers: 12,
  activeDrivers: 8,
  completionRate: 92,
  packagesByStatus: {
    pending: 23,
    in_delivery: 45,
    in_transit: 45,
    delivered: 88,
    delivery_failed: 5
  },
  availableDrivers: 8,
  totalZones: 5,
  todayDeliveries: 34
};

// Colis de démo
export const DEMO_PACKAGES = [
  {
    id: 1,
    trackingNumber: 'BX2024001',
    senderName: 'Kouadio Aya',
    senderPhone: '+225 07 08 09 10 11',
    senderAddress: 'Cocody, Abidjan',
    receiverName: 'Koné Ibrahim',
    receiverPhone: '+225 05 06 07 08 09',
    receiverAddress: 'Yopougon, Abidjan',
    receiverLat: 5.3364,
    receiverLng: -4.0267,
    weight: 2.5,
    description: 'Documents importants',
    status: 'pending',
    priority: 'normal',
    createdAt: new Date().toISOString(),
    assignedDriver: null
  },
  {
    id: 2,
    trackingNumber: 'BX2024002',
    senderName: 'Diallo Aminata',
    senderPhone: '+225 07 12 34 56 78',
    senderAddress: 'Marcory, Abidjan',
    receiverName: 'Traoré Seydou',
    receiverPhone: '+225 05 98 76 54 32',
    receiverAddress: 'Abobo, Abidjan',
    receiverLat: 5.4223,
    receiverLng: -4.0160,
    weight: 5.0,
    description: 'Colis fragile - Électronique',
    status: 'in_transit',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+225 07 00 00 00 01'
    }
  },
  {
    id: 3,
    trackingNumber: 'BX2024003',
    senderName: 'N\'Guessan Marie',
    senderPhone: '+225 07 11 22 33 44',
    senderAddress: 'Plateau, Abidjan',
    receiverName: 'Bamba Fatou',
    receiverPhone: '+225 05 44 33 22 11',
    receiverAddress: 'Koumassi, Abidjan',
    receiverLat: 5.2931,
    receiverLng: -3.9470,
    weight: 1.2,
    description: 'Vêtements',
    status: 'delivered',
    priority: 'normal',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    assignedDriver: {
      id: 3,
      name: 'Yao Emmanuel',
      phone: '+225 07 00 00 00 02'
    }
  }
];

// Livreurs de démo
export const DEMO_DRIVERS = [
  {
    id: 2,
    name: 'Jean Kouassi',
    phone: '+225 07 00 00 00 01',
    email: 'livreur@betex.com',
    status: 'active',
    currentLat: 5.3600,
    currentLng: -4.0083,
    assignedPackages: 3,
    completedToday: 5
  },
  {
    id: 3,
    name: 'Yao Emmanuel',
    phone: '+225 07 00 00 00 02',
    email: 'yao.emmanuel@betex.com',
    status: 'available',
    currentLat: 5.3500,
    currentLng: -4.0200,
    assignedPackages: 0,
    completedToday: 8
  },
  {
    id: 4,
    name: 'Koné Abdoulaye',
    phone: '+225 07 00 00 00 03',
    email: 'kone.abdoulaye@betex.com',
    status: 'active',
    currentLat: 5.3400,
    currentLng: -3.9900,
    assignedPackages: 2,
    completedToday: 6
  }
];

// Zones de démo
export const DEMO_ZONES = [
  {
    id: 1,
    name: 'Cocody',
    description: 'Zone résidentielle haut standing',
    coordinates: [[5.3364, -4.0267], [5.3500, -4.0100], [5.3600, -4.0200]],
    activePackages: 12,
    assignedDrivers: 3
  },
  {
    id: 2,
    name: 'Yopougon',
    description: 'Grande zone populaire',
    coordinates: [[5.3364, -4.0867], [5.3200, -4.0700], [5.3100, -4.0900]],
    activePackages: 18,
    assignedDrivers: 4
  }
];

// Fonction de connexion simulée
export const mockLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = Object.values(DEMO_USERS).find(
        u => u.email === email && u.password === password
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        resolve({
          success: true,
          data: {
            user: userWithoutPassword,
            token: user.token
          }
        });
      } else {
        reject({
          response: {
            data: {
              message: 'Email ou mot de passe incorrect'
            }
          }
        });
      }
    }, 500);
  });
};

// Fonction pour obtenir les statistiques
export const mockGetStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: DEMO_STATS
      });
    }, 300);
  });
};

// Fonction pour obtenir les colis
export const mockGetPackages = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          packages: DEMO_PACKAGES,
          total: DEMO_PACKAGES.length
        }
      });
    }, 400);
  });
};

// Fonction pour créer un colis
export const mockCreatePackage = async (packageData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPackage = {
        id: Date.now(),
        trackingNumber: `BX${Date.now()}`,
        ...packageData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      DEMO_PACKAGES.unshift(newPackage);
      
      resolve({
        success: true,
        data: newPackage,
        message: 'Colis créé avec succès (MODE DÉMO)'
      });
    }, 600);
  });
};

// Fonction pour obtenir les livreurs
export const mockGetDrivers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          drivers: DEMO_DRIVERS,
          total: DEMO_DRIVERS.length
        }
      });
    }, 300);
  });
};

// Fonction pour suggérer un livreur
export const mockSuggestDriver = async (location) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Suggère Jean Kouassi par défaut
      resolve({
        success: true,
        data: {
          driver: DEMO_DRIVERS[0],
          distance: 2.5,
          estimatedTime: 15
        }
      });
    }, 800);
  });
};

// Fonction pour obtenir les zones
export const mockGetZones = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          zones: DEMO_ZONES,
          total: DEMO_ZONES.length
        }
      });
    }, 300);
  });
};
