/**
 * Simple Database Population Script
 * Populate with essential test data
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002/api/v1';

async function createAdminToken() {
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@betex.com',
      password: 'admin123'
    });
    return loginResponse.data.data.accessToken;
  } catch (error) {
    console.error('❌ Impossible de se connecter comme admin:', error.response?.data?.message || error.message);
    return null;
  }
}

async function createDriver(token, driverData) {
  try {
    // Create user account
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: driverData.email,
      password: 'driver123',
      role: 'driver',
      firstName: driverData.firstName,
      lastName: driverData.lastName,
      phone: driverData.phone
    });

    const driverToken = registerResponse.data.data.accessToken;

    // Update driver info
    const driversResponse = await axios.get(`${API_URL}/drivers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const driver = driversResponse.data.data.drivers.find(d => d.email === driverData.email);
    
    if (driver) {
      await axios.patch(`${API_URL}/drivers/${driver.id}`, {
        vehicleType: driverData.vehicleType,
        vehiclePlate: driverData.vehiclePlate,
        totalDeliveries: driverData.totalDeliveries,
        successfulDeliveries: driverData.successfulDeliveries,
        rating: driverData.rating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update status and position
      await axios.patch(`${API_URL}/drivers/${driver.id}/status`, {
        status: driverData.status
      }, {
        headers: { Authorization: `Bearer ${driverToken}` }
      });

      // Send GPS position
      if (driverData.latitude && driverData.longitude) {
        await axios.post(`${API_URL}/gps/position`, {
          latitude: driverData.latitude,
          longitude: driverData.longitude,
          accuracy: 10
        }, {
          headers: { Authorization: `Bearer ${driverToken}` }
        });
      }
    }

    return driver;
  } catch (error) {
    if (error.response?.data?.message?.includes('already registered')) {
      console.log(`   ⚠️  ${driverData.email} existe déjà`);
      return null;
    }
    throw error;
  }
}

async function createPackage(token, packageData) {
  try {
    const response = await axios.post(`${API_URL}/packages`, packageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error(`❌ Erreur création colis pour ${packageData.customerName}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function populateDatabase() {
  console.log('🚀 Démarrage du peuplement de la base de données...\n');

  // Get admin token
  const adminToken = await createAdminToken();
  if (!adminToken) {
    console.error('❌ Impossible de se connecter. Vérifiez que le backend fonctionne.');
    return;
  }

  console.log('✅ Connexion admin réussie\n');

  // Create drivers
  console.log('👥 Création des livreurs additionnels...');
  
  const drivers = [
    {
      email: 'aya.kone@betex.com',
      firstName: 'Aya',
      lastName: 'Koné',
      phone: '+225 07 23 45 67 89',
      vehicleType: 'Moto',
      vehiclePlate: 'CD-5678-CI',
      status: 'online',
      latitude: 5.2892,
      longitude: -3.9778,
      totalDeliveries: 89,
      successfulDeliveries: 82,
      rating: 4.6
    },
    {
      email: 'mohamed.traore@betex.com',
      firstName: 'Mohamed',
      lastName: 'Traoré',
      phone: '+225 07 34 56 78 90',
      vehicleType: 'Véhicule',
      vehiclePlate: 'EF-9012-CI',
      status: 'in_delivery',
      latitude: 5.3205,
      longitude: -4.0137,
      totalDeliveries: 203,
      successfulDeliveries: 195,
      rating: 4.9
    },
    {
      email: 'fatou.diallo@betex.com',
      firstName: 'Fatou',
      lastName: 'Diallo',
      phone: '+225 07 45 67 89 01',
      vehicleType: 'Moto',
      vehiclePlate: 'GH-3456-CI',
      status: 'online',
      latitude: 5.3569,
      longitude: -4.0262,
      totalDeliveries: 76,
      successfulDeliveries: 71,
      rating: 4.5
    }
  ];

  for (const driver of drivers) {
    try {
      await createDriver(adminToken, driver);
      console.log(`   ✅ ${driver.firstName} ${driver.lastName}`);
    } catch (error) {
      console.log(`   ❌ Erreur ${driver.firstName}: ${error.message}`);
    }
  }

  // Create some test packages
  console.log('\n📦 Création de colis de test...');

  const packages = [
    {
      customerName: 'Marie Kouamé',
      customerPhone: '+225 01 11 11 11 11',
      senderName: 'Boutique Élégance',
      senderPhone: '+225 21 22 33 44 55',
      senderAddress: 'Plateau, Immeuble Alpha 2000',
      address: 'Cocody, Riviera Golf',
      packageType: 'document',
      packagePrice: 0,
      deliveryPrice: 1500,
      weight: 0.2,
      notes: 'Remettre en main propre uniquement',
      senderLatitude: 5.3205,
      senderLongitude: -4.0137,
      deliveryLatitude: 5.3599,
      deliveryLongitude: -3.9847
    },
    {
      customerName: 'Alassane Ouattara',
      customerPhone: '+225 02 22 22 22 22',
      senderName: 'Pharmacie du Centre',
      senderPhone: '+225 21 33 44 55 66',
      senderAddress: 'Adjamé, Marché',
      address: 'Yopougon, Niangon Sud',
      packageType: 'colis',
      packagePrice: 15000,
      deliveryPrice: 2500,
      weight: 1.5,
      notes: 'Médicaments - Fragile et urgent',
      senderLatitude: 5.3569,
      senderLongitude: -4.0262,
      deliveryLatitude: 5.3364,
      deliveryLongitude: -4.0867
    },
    {
      customerName: 'Grace Akoto',
      customerPhone: '+225 03 33 33 33 33',
      senderName: 'Restaurant Chez Tantine',
      senderPhone: '+225 21 44 55 66 77',
      senderAddress: 'Marcory, Zone 4',
      address: 'Koumassi, Remblais',
      packageType: 'nourriture',
      packagePrice: 8500,
      deliveryPrice: 2000,
      weight: 2.0,
      notes: 'Livraison à chaud - Maximum 45 minutes',
      senderLatitude: 5.2892,
      senderLongitude: -3.9778,
      deliveryLatitude: 5.2936,
      deliveryLongitude: -3.9370
    }
  ];

  for (const pkg of packages) {
    const createdPackage = await createPackage(adminToken, pkg);
    if (createdPackage) {
      console.log(`   ✅ ${pkg.customerName}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 BASE DE DONNÉES PEUPLÉE AVEC SUCCÈS !');
  console.log('='.repeat(60));
  
  console.log('\n🔑 COMPTES DISPONIBLES:');
  console.log('   🔐 Admin: admin@betex.com / admin123');
  console.log('   🚗 Jean Kouassi: livreur@betex.com / livreur123');
  console.log('   🚗 Aya Koné: aya.kone@betex.com / driver123');
  console.log('   🚗 Mohamed Traoré: mohamed.traore@betex.com / driver123');
  console.log('   🚗 Fatou Diallo: fatou.diallo@betex.com / driver123');
  
  console.log('\n📱 APPLICATION PRÊTE:');
  console.log('   🌐 URL: http://localhost:3003');
  console.log('   📦 Colis créés avec suggestion automatique');
  console.log('   🗺️  Livreurs positionnés sur Abidjan');
  console.log('   📊 Statistiques réalistes');
  
  console.log('\n🧪 TESTS RECOMMANDÉS:');
  console.log('   1. Connexion admin → Créer nouveau colis');
  console.log('   2. Système suggère livreur le plus proche');
  console.log('   3. Connexion livreur → Voir colis assignés');
  console.log('   4. Livreur met à jour statut des colis');
  console.log('   5. Admin voit changements en temps réel');
  
  console.log('\n' + '='.repeat(60));
}

// Execute if run directly
if (require.main === module) {
  populateDatabase().then(() => {
    console.log('\n✅ Terminé avec succès!');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  });
}

module.exports = populateDatabase;