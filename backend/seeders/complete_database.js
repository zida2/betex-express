/**
 * Complete Database Seeder
 * Populate the database with realistic test data
 */

const bcrypt = require('bcryptjs');
const { User, Driver, Zone, Package, GPSPosition, DeliveryHistory, AuditLog, DeliveryRequest } = require('../src/models');

const completeSeeder = async () => {
  try {
    console.log('🌱 Début du peuplement de la base de données...\n');

    // 1. USERS & ADMIN
    console.log('👥 1. Création des utilisateurs...');
    
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@betex.com' },
      defaults: {
        email: 'admin@betex.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        firstName: 'Admin',
        lastName: 'BETEX',
        phone: '+225 01 02 03 04 05',
        isActive: true
      }
    });
    console.log('   ✅ Admin principal créé');

    // 2. ZONES DE LIVRAISON
    console.log('\n🗺️  2. Création des zones de livraison...');
    
    const zones = [
      {
        name: 'Cocody',
        description: 'Zone résidentielle haut standing',
        centerLatitude: 5.3599,
        centerLongitude: -3.9847,
        isActive: true
      },
      {
        name: 'Plateau',
        description: 'Centre-ville d\'affaires',
        centerLatitude: 5.3205,
        centerLongitude: -4.0137,
        isActive: true
      },
      {
        name: 'Yopougon',
        description: 'Grande zone populaire',
        centerLatitude: 5.3364,
        centerLongitude: -4.0867,
        isActive: true
      },
      {
        name: 'Marcory',
        description: 'Zone industrielle et résidentielle',
        centerLatitude: 5.2892,
        centerLongitude: -3.9778,
        isActive: true
      },
      {
        name: 'Adjamé',
        description: 'Zone commerciale',
        centerLatitude: 5.3569,
        centerLongitude: -4.0262,
        isActive: true
      },
      {
        name: 'Abobo',
        description: 'Zone Nord d\'Abidjan',
        centerLatitude: 5.4233,
        centerLongitude: -4.0168,
        isActive: true
      },
      {
        name: 'Koumassi',
        description: 'Zone Est d\'Abidjan',
        centerLatitude: 5.2936,
        centerLongitude: -3.9370,
        isActive: true
      }
    ];

    const createdZones = [];
    for (const zone of zones) {
      const [zoneRecord] = await Zone.findOrCreate({
        where: { name: zone.name },
        defaults: zone
      });
      createdZones.push(zoneRecord);
    }
    console.log(`   ✅ ${createdZones.length} zones créées`);

    // 3. LIVREURS
    console.log('\n🚗 3. Création des livreurs...');
    
    const drivers = [
      {
        email: 'livreur@betex.com',
        password: 'livreur123',
        firstName: 'Jean',
        lastName: 'Kouassi',
        phone: '+225 07 12 34 56 78',
        vehicleType: 'Moto',
        vehiclePlate: 'AB-1234-CI',
        status: 'online',
        lastLatitude: 5.3599,
        lastLongitude: -3.9847,
        totalDeliveries: 147,
        successfulDeliveries: 134,
        rating: 4.8
      },
      {
        email: 'aya.kone@betex.com',
        password: 'driver123',
        firstName: 'Aya',
        lastName: 'Koné',
        phone: '+225 07 23 45 67 89',
        vehicleType: 'Moto',
        vehiclePlate: 'CD-5678-CI',
        status: 'online',
        lastLatitude: 5.2892,
        lastLongitude: -3.9778,
        totalDeliveries: 89,
        successfulDeliveries: 82,
        rating: 4.6
      },
      {
        email: 'mohamed.traore@betex.com',
        password: 'driver123',
        firstName: 'Mohamed',
        lastName: 'Traoré',
        phone: '+225 07 34 56 78 90',
        vehicleType: 'Véhicule',
        vehiclePlate: 'EF-9012-CI',
        status: 'in_delivery',
        lastLatitude: 5.3205,
        lastLongitude: -4.0137,
        totalDeliveries: 203,
        successfulDeliveries: 195,
        rating: 4.9
      },
      {
        email: 'fatou.diallo@betex.com',
        password: 'driver123',
        firstName: 'Fatou',
        lastName: 'Diallo',
        phone: '+225 07 45 67 89 01',
        vehicleType: 'Moto',
        vehiclePlate: 'GH-3456-CI',
        status: 'online',
        lastLatitude: 5.3569,
        lastLongitude: -4.0262,
        totalDeliveries: 76,
        successfulDeliveries: 71,
        rating: 4.5
      },
      {
        email: 'kouadio.nguessan@betex.com',
        password: 'driver123',
        firstName: 'Kouadio',
        lastName: 'N\'Guessan',
        phone: '+225 07 56 78 90 12',
        vehicleType: 'Moto',
        vehiclePlate: 'IJ-7890-CI',
        status: 'offline',
        lastLatitude: 5.4233,
        lastLongitude: -4.0168,
        totalDeliveries: 12,
        successfulDeliveries: 11,
        rating: 4.2
      },
      {
        email: 'aminata.sylla@betex.com',
        password: 'driver123',
        firstName: 'Aminata',
        lastName: 'Sylla',
        phone: '+225 07 67 89 01 23',
        vehicleType: 'Véhicule',
        vehiclePlate: 'KL-1357-CI',
        status: 'on_break',
        lastLatitude: 5.2936,
        lastLongitude: -3.9370,
        totalDeliveries: 156,
        successfulDeliveries: 145,
        rating: 4.7
      }
    ];

    const createdDrivers = [];
    for (const driver of drivers) {
      // Create user first
      const [user] = await User.findOrCreate({
        where: { email: driver.email },
        defaults: {
          email: driver.email,
          passwordHash: await bcrypt.hash(driver.password, 10),
          role: 'driver',
          firstName: driver.firstName,
          lastName: driver.lastName,
          phone: driver.phone,
          isActive: true
        }
      });

      // Create driver profile
      const [driverRecord] = await Driver.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          name: `${driver.firstName} ${driver.lastName}`,
          phone: driver.phone,
          email: driver.email,
          vehicleType: driver.vehicleType,
          vehiclePlate: driver.vehiclePlate,
          status: driver.status,
          lastLatitude: driver.lastLatitude,
          lastLongitude: driver.lastLongitude,
          lastPositionUpdate: new Date(),
          totalDeliveries: driver.totalDeliveries,
          successfulDeliveries: driver.successfulDeliveries,
          failedDeliveries: driver.totalDeliveries - driver.successfulDeliveries,
          rating: driver.rating
        }
      });
      createdDrivers.push(driverRecord);
    }
    console.log(`   ✅ ${createdDrivers.length} livreurs créés`);

    // 4. COLIS DE TEST
    console.log('\n📦 4. Création des colis de test...');
    
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
        status: 'delivered',
        notes: 'Remettre en main propre uniquement',
        pickupLatitude: 5.3205,
        pickupLongitude: -4.0137,
        deliveryLatitude: 5.3599,
        deliveryLongitude: -3.9847,
        driverId: createdDrivers[0].id // Jean Kouassi
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
        status: 'in_delivery',
        notes: 'Médicaments - Fragile et urgent',
        pickupLatitude: 5.3569,
        pickupLongitude: -4.0262,
        deliveryLatitude: 5.3364,
        deliveryLongitude: -4.0867,
        driverId: createdDrivers[2].id // Mohamed Traoré
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
        status: 'collected',
        notes: 'Livraison à chaud - Maximum 45 minutes',
        pickupLatitude: 5.2892,
        pickupLongitude: -3.9778,
        deliveryLatitude: 5.2936,
        deliveryLongitude: -3.9370,
        driverId: createdDrivers[1].id // Aya Koné
      },
      {
        customerName: 'Ibrahim Sangaré',
        customerPhone: '+225 04 44 44 44 44',
        senderName: 'Électro-Shop',
        senderPhone: '+225 21 55 66 77 88',
        senderAddress: 'Plateau, Rue du Commerce',
        address: 'Abobo, Baoulé',
        packageType: 'fragile',
        packagePrice: 45000,
        deliveryPrice: 3500,
        weight: 5.0,
        status: 'pending',
        notes: 'Télévision 32 pouces - Très fragile',
        pickupLatitude: 5.3205,
        pickupLongitude: -4.0137,
        deliveryLatitude: 5.4233,
        deliveryLongitude: -4.0168,
        driverId: null // Pas encore assigné
      },
      {
        customerName: 'Adjoua Brou',
        customerPhone: '+225 05 55 55 55 55',
        senderName: 'Librairie Moderne',
        senderPhone: '+225 21 66 77 88 99',
        senderAddress: 'Cocody, Deux-Plateaux',
        address: 'Marcory, Biétry',
        packageType: 'document',
        packagePrice: 0,
        deliveryPrice: 1800,
        weight: 1.0,
        status: 'pending',
        notes: 'Livres scolaires - Urgent pour demain',
        pickupLatitude: 5.3599,
        pickupLongitude: -3.9847,
        deliveryLatitude: 5.2892,
        deliveryLongitude: -3.9778,
        driverId: null
      },
      {
        customerName: 'Seydou Coulibaly',
        customerPhone: '+225 06 66 66 66 66',
        senderName: 'Pâtisserie Délice',
        senderPhone: '+225 21 77 88 99 00',
        senderAddress: 'Adjamé, Liberté',
        address: 'Plateau, Immeuble SCIAM',
        packageType: 'nourriture',
        packagePrice: 12000,
        deliveryPrice: 2200,
        weight: 3.0,
        status: 'delivery_failed',
        notes: 'Gâteau d\'anniversaire - Client absent',
        pickupLatitude: 5.3569,
        pickupLongitude: -4.0262,
        deliveryLatitude: 5.3205,
        deliveryLongitude: -4.0137,
        driverId: createdDrivers[3].id, // Fatou Diallo
        failureReason: 'Client non disponible'
      }
    ];

    const createdPackages = [];
    for (const pkg of packages) {
      const packageRecord = await Package.create(pkg);
      createdPackages.push(packageRecord);
    }
    console.log(`   ✅ ${createdPackages.length} colis créés`);

    // 5. HISTORIQUE GPS
    console.log('\n📍 5. Création de l\'historique GPS...');
    
    const gpsData = [];
    const now = new Date();
    
    // Generate GPS history for each driver
    for (const driver of createdDrivers) {
      if (driver.status !== 'offline') {
        // Generate 10 GPS points over the last 2 hours
        for (let i = 0; i < 10; i++) {
          const timestamp = new Date(now.getTime() - (i * 12 * 60 * 1000)); // Every 12 minutes
          const latVariation = (Math.random() - 0.5) * 0.01; // Small random movement
          const lngVariation = (Math.random() - 0.5) * 0.01;
          
          gpsData.push({
            driverId: driver.id,
            latitude: parseFloat(driver.lastLatitude) + latVariation,
            longitude: parseFloat(driver.lastLongitude) + lngVariation,
            accuracy: Math.floor(Math.random() * 20) + 5,
            speed: Math.floor(Math.random() * 60),
            heading: Math.floor(Math.random() * 360),
            timestamp: timestamp
          });
        }
      }
    }

    await GPSPosition.bulkCreate(gpsData);
    console.log(`   ✅ ${gpsData.length} points GPS créés`);

    // 6. HISTORIQUE DES LIVRAISONS
    console.log('\n📋 6. Création de l\'historique des livraisons...');
    
    const deliveryHistory = [];
    
    // For delivered packages
    const deliveredPackages = createdPackages.filter(p => p.status === 'delivered');
    for (const pkg of deliveredPackages) {
      deliveryHistory.push(
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'collected',
          timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000)), // 2 hours ago
          notes: 'Colis récupéré chez l\'expéditeur'
        },
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'in_delivery',
          timestamp: new Date(now.getTime() - (1.5 * 60 * 60 * 1000)), // 1.5 hours ago
          notes: 'En route vers le destinataire'
        },
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'delivered',
          timestamp: new Date(now.getTime() - (30 * 60 * 1000)), // 30 minutes ago
          notes: 'Livraison effectuée avec succès'
        }
      );
    }

    // For failed packages
    const failedPackages = createdPackages.filter(p => p.status === 'delivery_failed');
    for (const pkg of failedPackages) {
      deliveryHistory.push(
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'collected',
          timestamp: new Date(now.getTime() - (3 * 60 * 60 * 1000)),
          notes: 'Colis récupéré'
        },
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'in_delivery',
          timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000)),
          notes: 'En cours de livraison'
        },
        {
          packageId: pkg.id,
          driverId: pkg.driverId,
          status: 'delivery_failed',
          timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000)),
          notes: pkg.failureReason || 'Échec de livraison'
        }
      );
    }

    await DeliveryHistory.bulkCreate(deliveryHistory);
    console.log(`   ✅ ${deliveryHistory.length} entrées d'historique créées`);

    // 7. DEMANDES DE LIVRAISON CLIENT
    console.log('\n📋 7. Création des demandes de livraison client...');
    
    // Client qui a fait 3 demandes
    const clientName = 'Sophie Yao';
    const clientPhone = '+225 07 88 99 11 22';
    
    const deliveryRequests = [
      {
        // Demande 1: En attente d'approbation
        senderName: 'Boutique Mode Sophie',
        senderPhone: '+225 21 11 22 33 44',
        senderAddress: 'Cocody, Rue du Commerce 123',
        senderLat: 5.3599,
        senderLng: -3.9847,
        receiverName: clientName,
        receiverPhone: clientPhone,
        receiverAddress: 'Plateau, Immeuble Central 5B',
        receiverLat: 5.3205,
        receiverLng: -4.0137,
        description: 'Robes et accessoires (3 articles)',
        weight: 2.5,
        packagePrice: 35000,
        status: 'pending_approval',
        createdAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)) // 5 heures ago
      },
      {
        // Demande 2: Approuvée et envoyée au livreur
        senderName: 'Pharmacie Centrale',
        senderPhone: '+225 21 33 44 55 66',
        senderAddress: 'Adjamé, Liberté 456',
        senderLat: 5.3569,
        senderLng: -4.0262,
        receiverName: clientName,
        receiverPhone: clientPhone,
        receiverAddress: 'Plateau, Immeuble Central 5B',
        receiverLat: 5.3205,
        receiverLng: -4.0137,
        description: 'Médicaments + Vitamines (ordonnance)',
        weight: 0.5,
        packagePrice: 8500,
        deliveryPrice: 2500,
        adminNotes: 'Livraison urgent - Client malade',
        status: 'approved',
        driverId: createdDrivers[0].id, // Jean Kouassi
        driverName: createdDrivers[0].name,
        driverPhone: createdDrivers[0].phone,
        approvedAt: new Date(now.getTime() - (3 * 60 * 60 * 1000)), // 3 heures ago
        createdAt: new Date(now.getTime() - (4 * 60 * 60 * 1000)) // 4 heures ago
      },
      {
        // Demande 3: Livrée avec succès
        senderName: 'Restaurant Chez Tantine',
        senderPhone: '+225 21 55 66 77 88',
        senderAddress: 'Marcory, Zone 4 - 789',
        senderLat: 5.2892,
        senderLng: -3.9778,
        receiverName: clientName,
        receiverPhone: clientPhone,
        receiverAddress: 'Plateau, Immeuble Central 5B',
        receiverLat: 5.3205,
        receiverLng: -4.0137,
        description: 'Repas complet (4 portions) + Jus frais',
        weight: 3.0,
        packagePrice: 12500,
        deliveryPrice: 2000,
        adminNotes: 'Livraison à chaud - Fait hier matin',
        status: 'completed',
        driverId: createdDrivers[1].id, // Aya Koné
        driverName: createdDrivers[1].name,
        driverPhone: createdDrivers[1].phone,
        approvedAt: new Date(now.getTime() - (24 * 60 * 60 * 1000)), // 24 heures ago
        createdAt: new Date(now.getTime() - (25 * 60 * 60 * 1000)) // 25 heures ago
      }
    ];

    const createdRequests = [];
    for (const request of deliveryRequests) {
      const deliveryRequest = await DeliveryRequest.create(request);
      createdRequests.push(deliveryRequest);
    }
    console.log(`   ✅ ${createdRequests.length} demandes de livraison créées`);
    console.log(`      • Client: ${clientName} (${clientPhone})`);
    console.log(`      • 1 en attente d'approbation`);
    console.log(`      • 1 approuvée et envoyée à Jean Kouassi`);
    console.log(`      • 1 livrée par Aya Koné`);

    // 8. LOGS D'AUDIT
    console.log('\n📝 8. Création des logs d\'audit...');
    
    const auditLogs = [
      {
        userId: adminUser[0].id,
        action: 'CREATE_PACKAGE',
        resource: 'Package',
        resourceId: createdPackages[0].id,
        details: { customerName: createdPackages[0].customerName, deliveryPrice: createdPackages[0].deliveryPrice },
        timestamp: new Date(now.getTime() - (4 * 60 * 60 * 1000))
      },
      {
        userId: createdDrivers[0].userId,
        action: 'UPDATE_PACKAGE_STATUS',
        resource: 'Package',
        resourceId: createdPackages[0].id,
        details: { oldStatus: 'pending', newStatus: 'collected' },
        timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000))
      },
      {
        userId: createdDrivers[0].userId,
        action: 'UPDATE_DRIVER_STATUS',
        resource: 'Driver',
        resourceId: createdDrivers[0].id,
        details: { oldStatus: 'offline', newStatus: 'online' },
        timestamp: new Date(now.getTime() - (5 * 60 * 60 * 1000))
      }
    ];

    await AuditLog.bulkCreate(auditLogs);
    console.log(`   ✅ ${auditLogs.length} logs d'audit créés`);

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BASE DE DONNÉES COMPLÈTE CRÉÉE AVEC SUCCÈS !');
    console.log('='.repeat(60));
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   👥 Utilisateurs: ${drivers.length + 1} (1 admin + ${drivers.length} livreurs)`);
    console.log(`   🗺️  Zones: ${createdZones.length} zones de livraison`);
    console.log(`   🚗 Livreurs: ${createdDrivers.length} avec statistiques réalistes`);
    console.log(`   📦 Colis: ${createdPackages.length} avec différents statuts`);
    console.log(`   📋 Demandes clients: ${createdRequests.length} (du même client)`);
    console.log(`   📍 Points GPS: ${gpsData.length} positions historiques`);
    console.log(`   📝 Historique: ${deliveryHistory.length} événements de livraison`);
    console.log(`   📋 Audit: ${auditLogs.length} logs de traçabilité`);
    
    console.log('\n🔑 COMPTES DE TEST:');
    console.log('   🔐 Admin: admin@betex.com / admin123');
    console.log('   🚗 Livreurs actifs:');
    drivers.filter(d => d.status === 'online').forEach(d => {
      console.log(`      • ${d.email} / driver123 (${d.firstName} ${d.lastName})`);
    });
    
    console.log('\n🎯 DONNÉES RÉALISTES:');
    console.log('   ✅ Colis livré avec succès');
    console.log('   🚚 Colis en cours de livraison');
    console.log('   📦 Colis collecté');
    console.log('   ⏳ Colis en attente');
    console.log('   ❌ Colis échoué');
    console.log('\n📋 DEMANDES CLIENTS:');
    console.log(`   Client: ${clientName} - ${clientPhone}`);
    console.log('   ⏳ 1 en attente d\'approbation (Boutique Mode)');
    console.log('   ✅ 1 approuvée à Jean Kouassi (Pharmacie)');
    console.log('   📦 1 livrée par Aya Koné (Restaurant)');
    
    console.log('\n🚀 Prêt pour la démonstration complète !');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error.message);
    console.error(error.stack);
  }
};

module.exports = completeSeeder;

// Run if called directly
if (require.main === module) {
  const { sequelize } = require('../src/config/database');
  
  sequelize.sync({ force: false }).then(() => {
    completeSeeder().then(() => {
      console.log('\n✅ Seeder terminé avec succès');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
  });
}