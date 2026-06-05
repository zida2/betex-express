/**
 * Models Index
 * Central export for all database models
 */

const { sequelize } = require('../config/database');
const User = require('./User');
const Driver = require('./Driver');
const Package = require('./Package');
const Route = require('./Route');
const Zone = require('./Zone');
const GPSPosition = require('./GPSPosition');
const DeliveryHistory = require('./DeliveryHistory');
const AuditLog = require('./AuditLog');
const Product = require('./Product');
const Stock = require('./Stock');
const StockMovement = require('./StockMovement');
const DeliveryRequest = require('./DeliveryRequest');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasOne(Driver, { foreignKey: 'userId' });
  Driver.belongsTo(User, { foreignKey: 'userId' });

  // Zone associations
  Zone.hasMany(Package, { foreignKey: 'pickupZoneId', as: 'PickupPackages' });
  Zone.hasMany(Package, { foreignKey: 'deliveryZoneId', as: 'DeliveryPackages' });
  Package.belongsTo(Zone, { foreignKey: 'pickupZoneId', as: 'PickupZone' });
  Package.belongsTo(Zone, { foreignKey: 'deliveryZoneId', as: 'DeliveryZone' });

  Zone.hasMany(Driver, { foreignKey: 'currentZoneId' });
  Driver.belongsTo(Zone, { foreignKey: 'currentZoneId' });

  // Package associations
  Driver.hasMany(Package, { foreignKey: 'driverId' });
  Package.belongsTo(Driver, { foreignKey: 'driverId' });

  Route.hasMany(Package, { foreignKey: 'routeId' });
  Package.belongsTo(Route, { foreignKey: 'routeId' });

  // Route associations
  Driver.hasMany(Route, { foreignKey: 'driverId' });
  Route.belongsTo(Driver, { foreignKey: 'driverId' });

  // GPS Position associations
  Driver.hasMany(GPSPosition, { foreignKey: 'driverId' });
  GPSPosition.belongsTo(Driver, { foreignKey: 'driverId' });

  // Delivery History associations
  Package.hasMany(DeliveryHistory, { foreignKey: 'packageId' });
  DeliveryHistory.belongsTo(Package, { foreignKey: 'packageId' });

  Driver.hasMany(DeliveryHistory, { foreignKey: 'driverId' });
  DeliveryHistory.belongsTo(Driver, { foreignKey: 'driverId' });

  // Audit Log associations
  User.hasMany(AuditLog, { foreignKey: 'userId' });
  AuditLog.belongsTo(User, { foreignKey: 'userId' });

  // Product associations
  Product.hasMany(Stock, { foreignKey: 'productId' });
  Stock.belongsTo(Product, { foreignKey: 'productId' });

  // Stock associations
  Zone.hasMany(Stock, { foreignKey: 'zoneId' });
  Stock.belongsTo(Zone, { foreignKey: 'zoneId' });

  Stock.hasMany(StockMovement, { foreignKey: 'stockId' });
  StockMovement.belongsTo(Stock, { foreignKey: 'stockId' });

  // Stock Movement associations
  User.hasMany(StockMovement, { foreignKey: 'userId' });
  StockMovement.belongsTo(User, { foreignKey: 'userId' });

  // Delivery Request associations
  Driver.hasMany(DeliveryRequest, { foreignKey: 'driverId', as: 'deliveryRequests' });
  DeliveryRequest.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
};

// Call associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Driver,
  Package,
  Route,
  Zone,
  GPSPosition,
  DeliveryHistory,
  AuditLog,
  Product,
  Stock,
  StockMovement,
  DeliveryRequest
};
