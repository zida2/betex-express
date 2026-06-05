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
  },
  client: {
    id: 3,
    email: 'client@betex.com',
    password: 'client123',
    name: 'Client BETEX',
    role: 'client',
    token: 'demo_client_token_456789012'
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
    senderName: 'Ouédraogo Paul',
    senderPhone: '+226 70 12 34 56',
    senderAddress: 'Zone du Bois, Ouagadougou',
    receiverName: 'Sawadogo Marie',
    receiverPhone: '+226 76 54 32 10',
    receiverAddress: 'Gounghin, Ouagadougou',
    customerName: 'Sawadogo Marie',
    customerPhone: '+226 76 54 32 10',
    address: 'Gounghin, Ouagadougou',
    receiverLat: 12.3850,
    receiverLng: -1.5100,
    weight: 2.5,
    description: 'Documents importants',
    packagePrice: 15000,
    deliveryPrice: 2500,
    isPaid: false,
    status: 'pending',
    priority: 'normal',
    createdAt: new Date().toISOString(),
    assignedDriver: null
  },
  {
    id: 2,
    trackingNumber: 'BX2024002',
    senderName: 'Compaoré Aminata',
    senderPhone: '+226 70 11 22 33',
    senderAddress: 'Dassasgho, Ouagadougou',
    receiverName: 'Traoré Seydou',
    receiverPhone: '+226 75 44 33 22',
    receiverAddress: 'Ouaga 2000, Ouagadougou',
    customerName: 'Traoré Seydou',
    customerPhone: '+226 75 44 33 22',
    address: 'Ouaga 2000, Ouagadougou',
    receiverLat: 12.3400,
    receiverLng: -1.4750,
    weight: 5.0,
    description: 'Colis fragile - Électronique',
    notes: 'Appeler avant livraison',
    packagePrice: 85000,
    deliveryPrice: 5000,
    isPaid: true,
    status: 'in_delivery',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+226 70 00 00 01'
    },
    Zone: { name: 'Ouaga 2000' }
  },
  {
    id: 3,
    trackingNumber: 'BX2024003',
    senderName: 'Kaboré Marie',
    senderPhone: '+226 70 99 88 77',
    senderAddress: 'Somgandé, Ouagadougou',
    receiverName: 'Zongo Fatou',
    receiverPhone: '+226 75 11 22 33',
    receiverAddress: 'Tampouy, Ouagadougou',
    customerName: 'Zongo Fatou',
    customerPhone: '+226 75 11 22 33',
    address: 'Tampouy, Ouagadougou',
    receiverLat: 12.4050,
    receiverLng: -1.5350,
    weight: 1.2,
    description: 'Vêtements',
    packagePrice: 35000,
    deliveryPrice: 3000,
    isPaid: true,
    status: 'delivered',
    priority: 'normal',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+226 70 00 00 01'
    },
    Zone: { name: 'Tampouy' }
  },
  {
    id: 6,
    trackingNumber: 'BX2024006',
    senderName: 'Diallo Ibrahim',
    senderPhone: '+226 70 33 44 55',
    senderAddress: 'Zone du Bois, Ouagadougou',
    receiverName: 'Nikiema Awa',
    receiverPhone: '+226 76 88 99 00',
    receiverAddress: 'Cissin, Ouagadougou',
    customerName: 'Nikiema Awa',
    customerPhone: '+226 76 88 99 00',
    address: 'Cissin, Ouagadougou',
    receiverLat: 12.3950,
    receiverLng: -1.5450,
    weight: 3.2,
    description: 'Matériel de bureau',
    notes: 'Livraison urgente',
    packagePrice: 52000,
    deliveryPrice: 4500,
    isPaid: false,
    status: 'collected',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+226 70 00 00 01'
    },
    Zone: { name: 'Cissin' }
  },
  {
    id: 7,
    trackingNumber: 'BX2024007',
    senderName: 'Kone Salif',
    senderPhone: '+226 70 22 11 00',
    senderAddress: 'Dassasgho, Ouagadougou',
    receiverName: 'Ouattara Fati',
    receiverPhone: '+226 75 99 88 77',
    receiverAddress: 'Zone 1, Ouagadougou',
    customerName: 'Ouattara Fati',
    customerPhone: '+226 75 99 88 77',
    address: 'Zone 1, Ouagadougou',
    receiverLat: 12.3650,
    receiverLng: -1.5250,
    weight: 2.0,
    description: 'Nourriture',
    packagePrice: 28000,
    deliveryPrice: 3000,
    isPaid: true,
    status: 'in_delivery',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+226 70 00 00 01'
    },
    Zone: { name: 'Zone 1' }
  },
  {
    id: 21,
    trackingNumber: 'BX2024021',
    senderName: 'Boutique SAMA Electronics',
    senderPhone: '+226 70 15 25 35',
    senderAddress: 'Avenue Kwame Nkrumah, Zone du Bois, Ouagadougou',
    receiverName: 'Compaoré Aminata',
    receiverPhone: '+226 76 48 52 69',
    receiverAddress: 'Secteur 15, Ouaga 2000, Ouagadougou',
    customerName: 'Compaoré Aminata',
    customerPhone: '+226 76 48 52 69',
    address: 'Secteur 15, Ouaga 2000, Ouagadougou',
    receiverLat: 12.3420,
    receiverLng: -1.4720,
    weight: 1.5,
    description: 'Smartphone Samsung Galaxy - FRAGILE',
    notes: '⚠️ URGENT: Commande payée en avance. Client attend livraison avant 18h. Appeler 30min avant arrivée.',
    packagePrice: 250000,
    deliveryPrice: 5000,
    isPaid: true,
    status: 'pending',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    assignedDriver: {
      id: 2,
      name: 'Jean Kouassi',
      phone: '+226 70 00 00 01'
    },
    Zone: { name: 'Ouaga 2000' },
    pickupLocation: 'Boutique SAMA Electronics',
    pickupAddress: 'Avenue Kwame Nkrumah, Zone du Bois, Ouagadougou',
    pickupPhone: '+226 70 15 25 35',
    pickupInstructions: '📍 Face à la pharmacie centrale. Demander Moussa au comptoir. Code pickup: #SAMA2024',
    pickupLat: 12.3714,
    pickupLng: -1.5197,
    pickupContact: 'Moussa Traoré'
  }
];

// Livreurs de démo
export const DEMO_DRIVERS = [
  {
    id: 2,
    firstName: 'Jean',
    lastName: 'Kouassi',
    name: 'Jean Kouassi',
    phone: '+226 70 00 00 01',
    email: 'livreur@betex.com',
    cnib: 'BF 12345 67890 12345',
    status: 'active',
    currentLat: 12.3714,
    currentLng: -1.5197,
    assignedPackages: 2,
    completedToday: 5,
    totalDeliveries: 52,
    rating: 4.8,
    vehicleType: 'Moto',
    vehiclePlate: 'BF-1234-AB'
  },
  {
    id: 3,
    firstName: 'Yao',
    lastName: 'Emmanuel',
    name: 'Yao Emmanuel',
    phone: '+226 70 00 00 02',
    email: 'yao.emmanuel@betex.com',
    cnib: 'BF 98765 43210 54321',
    status: 'available',
    currentLat: 12.3850,
    currentLng: -1.5350,
    assignedPackages: 0,
    completedToday: 8,
    totalDeliveries: 45,
    rating: 4.6,
    vehicleType: 'Voiture',
    vehiclePlate: 'BF-5678-CD'
  },
  {
    id: 4,
    firstName: 'Koné',
    lastName: 'Abdoulaye',
    name: 'Koné Abdoulaye',
    phone: '+226 70 00 00 03',
    email: 'kone.abdoulaye@betex.com',
    cnib: 'BF 11111 22222 33333',
    status: 'active',
    currentLat: 12.3580,
    currentLng: -1.5080,
    assignedPackages: 2,
    completedToday: 6,
    totalDeliveries: 38,
    rating: 4.7,
    vehicleType: 'Moto',
    vehiclePlate: 'BF-9012-EF'
  }
];

// Zones de démo
export const DEMO_ZONES = [
  {
    id: 1,
    name: 'Zone du Bois',
    description: 'Zone commerciale centrale',
    coordinates: [[12.3714, -1.5197], [12.3800, -1.5100], [12.3750, -1.5250]],
    activePackages: 12,
    assignedDrivers: 3
  },
  {
    id: 2,
    name: 'Gounghin',
    description: 'Zone résidentielle',
    coordinates: [[12.3850, -1.5100], [12.3900, -1.5050], [12.3800, -1.5150]],
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
          data: {
            data: {
              user: userWithoutPassword,
              token: user.token
            }
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
        data: {
          data: DEMO_STATS
        }
      });
    }, 300);
  });
};

// Fonction pour obtenir les colis
export const mockGetPackages = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredPackages = [...DEMO_PACKAGES];
      
      // Filtrer par livreur si driverId est fourni
      if (params.driverId) {
        const driverId = parseInt(params.driverId);
        filteredPackages = DEMO_PACKAGES.filter(pkg => 
          pkg.assignedDriver && pkg.assignedDriver.id === driverId
        );
      }
      
      // Filtrer par statut si fourni
      if (params.status) {
        const statuses = params.status.split(',');
        filteredPackages = filteredPackages.filter(pkg =>
          statuses.includes(pkg.status)
        );
      }
      
      resolve({
        data: {
          data: filteredPackages,
          total: filteredPackages.length
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
        data: {
          data: newPackage,
          message: 'Colis créé avec succès (MODE DÉMO)'
        }
      });
    }, 600);
  });
};

// Fonction pour obtenir les livreurs
export const mockGetDrivers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: DEMO_DRIVERS,
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
        data: {
          data: {
            driver: DEMO_DRIVERS[0],
            distance: 2.5,
            estimatedTime: 15
          }
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
        data: {
          data: DEMO_ZONES,
          total: DEMO_ZONES.length
        }
      });
    }, 300);
  });
};

// Fonction pour obtenir les statistiques d'un livreur
export const mockGetDriverStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: {
            successfulDeliveries: 48,
            totalDeliveries: 52,
            rating: 4.8,
            completedToday: 5,
            onTimeRate: 95
          }
        }
      });
    }, 300);
  });
};

// Fonction pour obtenir l'historique des livraisons
export const mockGetHistory = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const oneWeekAgo = Date.now() - (7 * 86400000);
      const allPackages = [
        ...DEMO_PACKAGES,
        // Livraisons d'il y a une semaine (10 livraisons)
        {
          id: 10,
          trackingNumber: 'BX2024010',
          senderName: 'Bakayoko Ahmed',
          receiverName: 'Ouattara Mariam',
          customerName: 'Ouattara Mariam',
          address: 'Gounghin, Ouagadougou',
          receiverAddress: 'Gounghin, Ouagadougou',
          receiverPhone: '+226 76 11 22 33',
          packagePrice: 42000,
          deliveryPrice: 3500,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 1000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 11,
          trackingNumber: 'BX2024011',
          senderName: 'Coulibaly Issa',
          receiverName: 'Sanogo Fatoumata',
          customerName: 'Sanogo Fatoumata',
          address: 'Tampouy, Ouagadougou',
          receiverAddress: 'Tampouy, Ouagadougou',
          receiverPhone: '+226 75 22 33 44',
          packagePrice: 55000,
          deliveryPrice: 4000,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 2000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 500000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 12,
          trackingNumber: 'BX2024012',
          senderName: 'Diarra Moussa',
          receiverName: 'Koné Aïssata',
          customerName: 'Koné Aïssata',
          address: 'Cissin, Ouagadougou',
          receiverAddress: 'Cissin, Ouagadougou',
          receiverPhone: '+226 70 33 44 55',
          description: 'Électronique',
          packagePrice: 125000,
          deliveryPrice: 5000,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 3000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 1000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 13,
          trackingNumber: 'BX2024013',
          senderName: 'Traoré Salif',
          receiverName: 'Ouédraogo Rasmata',
          customerName: 'Ouédraogo Rasmata',
          address: 'Zone 1, Ouagadougou',
          receiverAddress: 'Zone 1, Ouagadougou',
          receiverPhone: '+226 76 44 55 66',
          description: 'Documents',
          packagePrice: 18000,
          deliveryPrice: 2500,
          isPaid: false,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 4000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 1500000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 14,
          trackingNumber: 'BX2024014',
          senderName: 'Sawadogo Ali',
          receiverName: 'Compaoré Awa',
          customerName: 'Compaoré Awa',
          address: 'Ouaga 2000, Ouagadougou',
          receiverAddress: 'Ouaga 2000, Ouagadougou',
          receiverPhone: '+226 75 55 66 77',
          description: 'Vêtements',
          packagePrice: 65000,
          deliveryPrice: 4000,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 5000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 2000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 15,
          trackingNumber: 'BX2024015',
          senderName: 'Kaboré Moussa',
          receiverName: 'Nikiema Ibrahim',
          customerName: 'Nikiema Ibrahim',
          address: 'Dassasgho, Ouagadougou',
          receiverAddress: 'Dassasgho, Ouagadougou',
          receiverPhone: '+226 70 66 77 88',
          description: 'Nourriture',
          packagePrice: 32000,
          deliveryPrice: 3000,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 6000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 2500000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 16,
          trackingNumber: 'BX2024016',
          senderName: 'Zongo Seydou',
          receiverName: 'Diallo Mariam',
          customerName: 'Diallo Mariam',
          address: 'Somgandé, Ouagadougou',
          receiverAddress: 'Somgandé, Ouagadougou',
          receiverPhone: '+226 76 77 88 99',
          description: 'Colis fragile',
          packagePrice: 78000,
          deliveryPrice: 4500,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 7000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 3000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 17,
          trackingNumber: 'BX2024017',
          senderName: 'Ouattara Paul',
          receiverName: 'Traoré Aminata',
          customerName: 'Traoré Aminata',
          address: 'Zone du Bois, Ouagadougou',
          receiverAddress: 'Zone du Bois, Ouagadougou',
          receiverPhone: '+226 75 88 99 00',
          description: 'Équipements',
          packagePrice: 95000,
          deliveryPrice: 5000,
          isPaid: false,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 8000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 3500000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 18,
          trackingNumber: 'BX2024018',
          senderName: 'Nikiema Souleymane',
          receiverName: 'Sawadogo Fati',
          customerName: 'Sawadogo Fati',
          address: 'Gounghin, Ouagadougou',
          receiverAddress: 'Gounghin, Ouagadougou',
          receiverPhone: '+226 70 99 00 11',
          description: 'Fournitures',
          packagePrice: 28000,
          deliveryPrice: 3000,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 9000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 4000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 19,
          trackingNumber: 'BX2024019',
          senderName: 'Compaoré Issouf',
          receiverName: 'Kaboré Salimata',
          customerName: 'Kaboré Salimata',
          address: 'Tampouy, Ouagadougou',
          receiverAddress: 'Tampouy, Ouagadougou',
          receiverPhone: '+226 76 00 11 22',
          description: 'Accessoires',
          packagePrice: 45000,
          deliveryPrice: 3500,
          isPaid: true,
          status: 'delivered',
          createdAt: new Date(oneWeekAgo - 10000000).toISOString(),
          deliveredAt: new Date(oneWeekAgo - 4500000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        // Quelques échecs
        {
          id: 20,
          trackingNumber: 'BX2024020',
          senderName: 'Diallo Mamadou',
          receiverName: 'Ouédraogo Raogo',
          customerName: 'Ouédraogo Raogo',
          address: 'Pissy, Ouagadougou',
          receiverAddress: 'Pissy, Ouagadougou',
          receiverPhone: '+226 75 11 22 33',
          description: 'Colis non récupéré',
          packagePrice: 35000,
          deliveryPrice: 3000,
          isPaid: false,
          status: 'delivery_failed',
          failureReason: 'Adresse introuvable',
          failureNotes: 'Le client a donné une mauvaise adresse. Contacté mais sans réponse.',
          createdAt: new Date(oneWeekAgo - 11000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 22,
          trackingNumber: 'BX2024022',
          senderName: 'Hassan Alim',
          receiverName: 'Ouattara Moussa',
          customerName: 'Ouattara Moussa',
          address: 'Patte d\'oie, Ouagadougou',
          receiverAddress: 'Patte d\'oie, Ouagadougou',
          receiverPhone: '+226 70 12 34 56',
          description: 'Électronique',
          packagePrice: 165000,
          deliveryPrice: 5000,
          isPaid: true,
          status: 'delivery_failed',
          failureReason: 'Client refusé - Colis endommagé',
          failureNotes: 'Emballage trouvé endommagé lors de la livraison. Client a refusé de signer.',
          createdAt: new Date(oneWeekAgo - 12000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        },
        {
          id: 23,
          trackingNumber: 'BX2024023',
          senderName: 'Boutique Chic Mode',
          receiverName: 'Sow Aminata',
          customerName: 'Sow Aminata',
          address: 'Bogodogo, Ouagadougou',
          receiverAddress: 'Bogodogo, Ouagadougou',
          receiverPhone: '+226 76 45 67 89',
          description: 'Vêtements',
          packagePrice: 52000,
          deliveryPrice: 3500,
          isPaid: true,
          status: 'delivery_failed',
          failureReason: 'Client absent',
          failureNotes: 'Client n\'a pas répondu lors de la tentative. Avis de passage laissé. À réessayer demain.',
          createdAt: new Date(oneWeekAgo - 13000000).toISOString(),
          assignedDriver: { id: 2, name: 'Jean Kouassi' }
        }
      ];
      
      // Filtrer par livreur si driverId est fourni
      let filteredPackages = allPackages;
      if (params.driverId) {
        const driverId = parseInt(params.driverId);
        filteredPackages = allPackages.filter(pkg => 
          pkg.assignedDriver && pkg.assignedDriver.id === driverId
        );
      }
      
      resolve({
        data: {
          data: filteredPackages,
          total: filteredPackages.length
        }
      });
    }, 400);
  });
};

// Fonction pour obtenir la charge de travail des livreurs
export const mockGetWorkload = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const workload = DEMO_DRIVERS.map(driver => ({
        driverId: driver.id,
        driverName: driver.name,
        status: driver.status,
        assignedPackages: driver.assignedPackages || 0,
        totalWeight: (driver.assignedPackages || 0) * 3.5, // Poids moyen par colis
        successRate: 0.92 + (Math.random() * 0.08) // Entre 92% et 100%
      }));
      
      resolve({
        data: {
          data: workload
        }
      });
    }, 400);
  });
};

// Fonction pour assigner plusieurs colis
export const mockAssignPackages = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { packageIds } = data;
      
      resolve({
        data: {
          data: packageIds.map(id => ({
            packageId: id,
            assignedDriver: DEMO_DRIVERS[0],
            message: 'Colis assigné avec succès (MODE DÉMO)'
          })),
          message: `${packageIds.length} colis assignés avec succès (MODE DÉMO)`
        }
      });
    }, 800);
  });
};

// Fonction pour obtenir les tournées
export const mockGetRoutes = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: {
            routes: [
              {
                id: 1,
                Driver: DEMO_DRIVERS[0],
                phase: 'Collecte matin',
                status: 'in_progress',
                totalPackages: 5,
                completedPackages: 2,
                estimatedDuration: 45
              }
            ]
          }
        }
      });
    }, 400);
  });
};

// Fonction pour créer une tournée
export const mockCreateRoute = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: {
            id: Date.now(),
            ...data,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          message: 'Tournée créée avec succès (MODE DÉMO)'
        }
      });
    }, 600);
  });
};

// Demandes de livraison de démo
export const DEMO_DELIVERY_REQUESTS = [
  {
    id: 'req-001',
    status: 'pending_approval',
    senderName: 'Jean Kouassi',
    senderPhone: '+226 70 12 34 56',
    senderAddress: 'Zone du Bois, Ouagadougou',
    senderLat: 12.3714,
    senderLng: -1.5197,
    receiverName: 'Marie Dupont',
    receiverPhone: '+226 76 54 32 10',
    receiverAddress: 'Gounghin, Ouagadougou',
    receiverLat: 12.3850,
    receiverLng: -1.5100,
    description: 'Livre de Littérature',
    weight: 0.5,
    packagePrice: 0,
    deliveryPrice: null,
    adminNotes: null,
    driverId: null,
    driverName: null,
    driverPhone: null,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    approvedAt: null
  },
  {
    id: 'req-002',
    status: 'approved',
    senderName: 'Compaoré Aminata',
    senderPhone: '+226 70 11 22 33',
    senderAddress: 'Dassasgho, Ouagadougou',
    senderLat: 12.3650,
    senderLng: -1.5250,
    receiverName: 'Traoré Seydou',
    receiverPhone: '+226 75 44 33 22',
    receiverAddress: 'Ouaga 2000, Ouagadougou',
    receiverLat: 12.3400,
    receiverLng: -1.4750,
    description: 'Vêtements (3 paquets)',
    weight: 2.0,
    packagePrice: 0,
    deliveryPrice: 4000,
    adminNotes: 'Livraison urgente avant 14h',
    driverId: 'driver-2',
    driverName: 'Jean Kouassi',
    driverPhone: '+226 70 00 00 01',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    approvedAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 'req-003',
    status: 'approved',
    senderName: 'Kaboré Marie',
    senderPhone: '+226 70 99 88 77',
    senderAddress: 'Somgandé, Ouagadougou',
    senderLat: 12.3950,
    senderLng: -1.5450,
    receiverName: 'Zongo Fatou',
    receiverPhone: '+226 75 11 22 33',
    receiverAddress: 'Tampouy, Ouagadougou',
    receiverLat: 12.4050,
    receiverLng: -1.5350,
    description: 'Électronique - Portable',
    weight: 0.8,
    packagePrice: 0,
    deliveryPrice: 5000,
    adminNotes: 'Colis fragile - Appeler avant livraison',
    driverId: 'driver-3',
    driverName: 'Yao Emmanuel',
    driverPhone: '+226 70 00 00 02',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    approvedAt: new Date(Date.now() - 2700000).toISOString()
  },
  {
    id: 'req-004',
    status: 'pending_approval',
    senderName: 'Diallo Ibrahim',
    senderPhone: '+226 70 33 44 55',
    senderAddress: 'Zone du Bois, Ouagadougou',
    senderLat: 12.3714,
    senderLng: -1.5197,
    receiverName: 'Nikiema Awa',
    receiverPhone: '+226 76 88 99 00',
    receiverAddress: 'Cissin, Ouagadougou',
    receiverLat: 12.3950,
    receiverLng: -1.5450,
    description: 'Matériel de bureau - Imprimante',
    weight: 5.0,
    packagePrice: 0,
    deliveryPrice: null,
    adminNotes: null,
    driverId: null,
    driverName: null,
    driverPhone: null,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    approvedAt: null
  },
  {
    id: 'req-005',
    status: 'pending_approval',
    senderName: 'Kone Salif',
    senderPhone: '+226 70 22 11 00',
    senderAddress: 'Dassasgho, Ouagadougou',
    senderLat: 12.3650,
    senderLng: -1.5250,
    receiverName: 'Ouattara Fati',
    receiverPhone: '+226 75 99 88 77',
    receiverAddress: 'Zone 1, Ouagadougou',
    receiverLat: 12.3650,
    receiverLng: -1.5250,
    description: 'Nourriture préparée (urgent)',
    weight: 1.5,
    packagePrice: 0,
    deliveryPrice: null,
    adminNotes: null,
    driverId: null,
    driverName: null,
    driverPhone: null,
    createdAt: new Date(Date.now() - 180000).toISOString(),
    approvedAt: null
  },
  {
    id: 'req-006',
    status: 'rejected',
    senderName: 'Boutique Fashion Plus',
    senderPhone: '+226 70 55 66 77',
    senderAddress: 'Zone du Bois, Ouagadougou',
    senderLat: 12.3714,
    senderLng: -1.5197,
    receiverName: 'Sawadogo Aïssata',
    receiverPhone: '+226 76 77 88 99',
    receiverAddress: 'Patte d\'oie, Ouagadougou',
    receiverLat: 12.3800,
    receiverLng: -1.5400,
    description: 'Vêtements importés',
    weight: 3.0,
    packagePrice: 0,
    deliveryPrice: null,
    adminNotes: 'Zone non couverte',
    driverId: null,
    driverName: null,
    driverPhone: null,
    rejectionReason: 'Zone de livraison non couverte - Demander au client de changer l\'adresse',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    approvedAt: null,
    rejectedAt: new Date(Date.now() - 6300000).toISOString()
  }
];

// Fonction pour obtenir les demandes de livraison
export const mockGetDeliveryRequests = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRequests = [...DEMO_DELIVERY_REQUESTS];
      
      // Filtrer par statut si fourni
      if (params.status) {
        filteredRequests = filteredRequests.filter(req => 
          req.status === params.status
        );
      }
      
      resolve({
        data: {
          data: filteredRequests,
          total: filteredRequests.length
        }
      });
    }, 400);
  });
};

// Fonction pour créer une demande de livraison
export const mockCreateDeliveryRequest = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest = {
        id: `req-${Date.now()}`,
        status: 'pending_approval',
        ...data,
        deliveryPrice: null,
        adminNotes: null,
        driverId: null,
        driverName: null,
        driverPhone: null,
        createdAt: new Date().toISOString(),
        approvedAt: null
      };
      
      DEMO_DELIVERY_REQUESTS.unshift(newRequest);
      
      resolve({
        data: {
          data: newRequest,
          message: 'Demande créée avec succès (MODE DÉMO)'
        }
      });
    }, 600);
  });
};

// Fonction pour approuver une demande
export const mockApproveDeliveryRequest = async (requestId, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const request = DEMO_DELIVERY_REQUESTS.find(r => r.id === requestId);
      
      if (request) {
        request.status = 'approved';
        request.deliveryPrice = data.deliveryPrice;
        request.adminNotes = data.adminNotes || null;
        request.driverId = data.driverId;
        request.driverName = data.driverName;
        request.driverPhone = data.driverPhone;
        request.approvedAt = new Date().toISOString();
        
        resolve({
          data: {
            data: request,
            message: 'Demande approuvée et assignée au livreur (MODE DÉMO)'
          }
        });
      } else {
        resolve({
          data: {
            error: 'Demande non trouvée'
          }
        });
      }
    }, 600);
  });
};

// Fonction pour rejeter une demande
export const mockRejectDeliveryRequest = async (requestId, rejectionReason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const request = DEMO_DELIVERY_REQUESTS.find(r => r.id === requestId);
      
      if (request) {
        request.status = 'rejected';
        request.rejectionReason = rejectionReason;
        request.rejectedAt = new Date().toISOString();
        
        resolve({
          data: {
            data: request,
            message: 'Demande rejetée (MODE DÉMO)'
          }
        });
      } else {
        resolve({
          data: {
            error: 'Demande non trouvée'
          }
        });
      }
    }, 600);
  });
};

// Fonction pour envoyer un message au client
export const mockSendMessageToClient = async (requestId, message, messageType = 'whatsapp') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const request = DEMO_DELIVERY_REQUESTS.find(r => r.id === requestId);
      
      if (request) {
        const whatsappLink = `https://wa.me/${request.receiverPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
        
        resolve({
          data: {
            data: {
              request: request,
              whatsappLink: whatsappLink,
              message: 'Message préparé avec succès (MODE DÉMO)'
            }
          }
        });
      } else {
        resolve({
          data: {
            error: 'Demande non trouvée'
          }
        });
      }
    }, 400);
  });
};

// Fonction pour obtenir les livreurs disponibles
export const mockGetAvailableDrivers = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: DEMO_DRIVERS,
          message: 'Livreurs disponibles récupérés (MODE DÉMO)'
        }
      });
    }, 300);
  });
};
