/**
 * Initial Database Seeding Script
 * Creates admin user, test drivers, zones, and pricing configuration
 * 
 * Usage:
 * node seeders/seed_initial_data.js
 */

require('dotenv').config();
const sequelize = require('../src/models').sequelize;
const { User, Driver, Zone, PricingConfig, TimeSlot } = require('../src/models');
const authService = require('../src/services/authService');
const logger = require('../src/utils/logger');

const seedInitialData = async () => {
  try {
    logger.info('Starting database seeding...');

    // Authenticate with database
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synchronized');

    // ============================================
    // SEED 1: Create Admin User
    // ============================================
    const adminExists = await User.findOne({
      where: { email: 'admin@betex.com' }
    });

    let adminUser;
    if (adminExists) {
      logger.info('Admin user already exists');
      adminUser = adminExists;
    } else {
      const hashedPassword = await authService.hashPassword('admin123');
      adminUser = await User.create({
        email: 'admin@betex.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'BETEX',
        phone: '+226 25 00 00 00',
        role: 'admin',
        status: 'active',
        cnib: '01234567'
      });
      logger.info('✅ Admin user created: admin@betex.com / admin123');
    }

    // ============================================
    // SEED 2: Create Test Drivers
    // ============================================
    const testDrivers = [
      {
        firstName: 'Jean',
        lastName: 'Kouassi',
        email: 'jean@betex.com',
        phone: '+226 70 50 50 50',
        licenseNumber: 'BF-DL-001',
        vehicleType: 'Moto',
        vehiclePlate: 'BF-001-OUA'
      },
      {
        firstName: 'Fatou',
        lastName: 'Coulibaly',
        email: 'fatou@betex.com',
        phone: '+226 70 60 60 60',
        licenseNumber: 'BF-DL-002',
        vehicleType: 'Moto',
        vehiclePlate: 'BF-002-OUA'
      },
      {
        firstName: 'Ahmed',
        lastName: 'Diallo',
        email: 'ahmed@betex.com',
        phone: '+226 70 70 70 70',
        licenseNumber: 'BF-DL-003',
        vehicleType: 'Moto',
        vehiclePlate: 'BF-003-OUA'
      },
      {
        firstName: 'Marie',
        lastName: 'Traore',
        email: 'marie@betex.com',
        phone: '+226 70 80 80 80',
        licenseNumber: 'BF-DL-004',
        vehicleType: 'Moto',
        vehiclePlate: 'BF-004-OUA'
      }
    ];

    const createdDrivers = [];
    for (const driverData of testDrivers) {
      const existing = await User.findOne({
        where: { email: driverData.email }
      });

      if (existing) {
        logger.info(`Driver ${driverData.firstName} already exists`);
        createdDrivers.push(existing);
      } else {
        const hashedPassword = await authService.hashPassword('driver123');
        const user = await User.create({
          email: driverData.email,
          password_hash: hashedPassword,
          first_name: driverData.firstName,
          last_name: driverData.lastName,
          phone: driverData.phone,
          role: 'driver',
          status: 'active',
          current_lat: 12.3656,
          current_lng: -1.5197
        });

        await Driver.create({
          user_id: user.id,
          license_number: driverData.licenseNumber,
          vehicle_type: driverData.vehicleType,
          vehicle_plate: driverData.vehiclePlate,
          status: 'active',
          verified: true,
          salary_amount: 60000,
          fuel_cost_daily: 2000
        });

        createdDrivers.push(user);
        logger.info(`✅ Driver created: ${driverData.firstName} ${driverData.lastName}`);
      }
    }

    // ============================================
    // SEED 3: Create Zones
    // ============================================
    const zones = [
      {
        name: 'Zone Centre-Ville',
        description: 'Centre historique et commercial',
        price_scheduled: 1500,
        min_latitude: 12.3600,
        max_latitude: 12.3700,
        min_longitude: -1.5300,
        max_longitude: -1.5150,
        coverage_description: 'Secteur 1, 2, 3 - Centre Ville',
        active: true
      },
      {
        name: 'Zone Plateau',
        description: 'Quartiers résidentiels',
        price_scheduled: 1200,
        min_latitude: 12.3400,
        max_latitude: 12.3600,
        min_longitude: -1.5500,
        max_longitude: -1.5300,
        coverage_description: 'Secteur 4, 5, 6 - Plateau',
        active: true
      },
      {
        name: 'Zone Bogodogo',
        description: 'Zone ouest',
        price_scheduled: 1300,
        min_latitude: 12.3700,
        max_latitude: 12.3900,
        min_longitude: -1.5700,
        max_longitude: -1.5500,
        coverage_description: 'Bogodogo, Gounghin',
        active: true
      },
      {
        name: 'Zone Baskuy',
        description: 'Zone est',
        price_scheduled: 1400,
        min_latitude: 12.3500,
        max_latitude: 12.3700,
        min_longitude: -1.4900,
        max_longitude: -1.4700,
        coverage_description: 'Baskuy, Koulouba',
        active: true
      },
      {
        name: 'Zone Secteur 30',
        description: 'Zone sud',
        price_scheduled: 1100,
        min_latitude: 12.3300,
        max_latitude: 12.3500,
        min_longitude: -1.5300,
        max_longitude: -1.5100,
        coverage_description: 'Secteur 30, 31, Dassasgho',
        active: true
      }
    ];

    for (const zoneData of zones) {
      const existing = await Zone.findOne({
        where: { name: zoneData.name }
      });

      if (existing) {
        logger.info(`Zone ${zoneData.name} already exists`);
      } else {
        await Zone.create(zoneData);
        logger.info(`✅ Zone created: ${zoneData.name} (${zoneData.price_scheduled} FCFA)`);
      }
    }

    // ============================================
    // SEED 4: Create Time Slots
    // ============================================
    const timeSlots = [
      {
        slot_name: 'Collecte du Matin',
        start_time: '07:00:00',
        end_time: '10:00:00',
        capacity: 50,
        is_morning: true,
        slot_order: 1,
        active: true
      },
      {
        slot_name: 'Collecte du Soir',
        start_time: '15:00:00',
        end_time: '17:00:00',
        capacity: 50,
        is_morning: false,
        slot_order: 2,
        active: true
      }
    ];

    for (const slotData of timeSlots) {
      const existing = await TimeSlot.findOne({
        where: { slot_name: slotData.slot_name }
      });

      if (existing) {
        logger.info(`Time slot ${slotData.slot_name} already exists`);
      } else {
        await TimeSlot.create(slotData);
        logger.info(
          `✅ Time slot created: ${slotData.slot_name} (${slotData.start_time} - ${slotData.end_time})`
        );
      }
    }

    // ============================================
    // SEED 5: Create Pricing Configuration
    // ============================================
    const pricingConfigs = [
      {
        delivery_type: 'express',
        express_base_price: 500,
        express_price_per_km: 250,
        express_min_price: 500,
        express_max_price: 10000,
        active: true
      },
      {
        delivery_type: 'scheduled',
        scheduled_zones_managed: true,
        active: true
      }
    ];

    for (const configData of pricingConfigs) {
      const existing = await PricingConfig.findOne({
        where: { delivery_type: configData.delivery_type }
      });

      if (existing) {
        logger.info(`Pricing config for ${configData.delivery_type} already exists`);
      } else {
        await PricingConfig.create(configData);
        logger.info(`✅ Pricing config created: ${configData.delivery_type}`);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    logger.info('');
    logger.info('╔════════════════════════════════════════════════════════════╗');
    logger.info('║              DATABASE SEEDING COMPLETED ✅                  ║');
    logger.info('╠════════════════════════════════════════════════════════════╣');
    logger.info('║                                                            ║');
    logger.info('║ 📧 Admin Account:                                          ║');
    logger.info('║    Email:    admin@betex.com                               ║');
    logger.info('║    Password: admin123                                      ║');
    logger.info('║                                                            ║');
    logger.info('║ 👥 Test Drivers: 4 drivers created                         ║');
    logger.info('║    - jean@betex.com (password: driver123)                  ║');
    logger.info('║    - fatou@betex.com (password: driver123)                 ║');
    logger.info('║    - ahmed@betex.com (password: driver123)                 ║');
    logger.info('║    - marie@betex.com (password: driver123)                 ║');
    logger.info('║                                                            ║');
    logger.info('║ 📍 Zones: 5 zones in Ouagadougou                           ║');
    logger.info('║ ⏰ Time Slots: Morning (7-10 AM), Evening (3-5 PM)          ║');
    logger.info('║ 💰 Pricing: Express & Scheduled configured                 ║');
    logger.info('║                                                            ║');
    logger.info('║ Ready to start backend server!                             ║');
    logger.info('║                                                            ║');
    logger.info('╚════════════════════════════════════════════════════════════╝');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedInitialData();
