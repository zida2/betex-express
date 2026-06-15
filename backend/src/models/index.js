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
const Announcement = require('./Announcement');

// New models for logistics platform
const ClientStorage = require('./ClientStorage');
const Expense = require('./Expense');
const Shipment = require('./Shipment');
const ScheduledDelivery = require('./ScheduledDelivery');
const FinancialRecord = require('./FinancialRecord');

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
  
  // New: Client-based stock associations
  User.hasMany(Stock, { foreignKey: 'clientId', as: 'ClientStocks' });
  Stock.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });

  Stock.hasMany(StockMovement, { foreignKey: 'stockId' });
  StockMovement.belongsTo(Stock, { foreignKey: 'stockId' });

  // Stock Movement associations
  User.hasMany(StockMovement, { foreignKey: 'userId' });
  StockMovement.belongsTo(User, { foreignKey: 'userId' });

  // Delivery Request associations
  Driver.hasMany(DeliveryRequest, { foreignKey: 'driverId', as: 'deliveryRequests' });
  DeliveryRequest.belongsTo(Driver, { foreignKey: 'driverId', as: 'driver' });
  
  // Client Storage associations
  User.hasOne(ClientStorage, { foreignKey: 'clientId', as: 'StorageService' });
  ClientStorage.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });
  User.hasMany(ClientStorage, { foreignKey: 'approvedBy', as: 'ApprovedStorages' });
  ClientStorage.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });
  
  // Expense associations
  User.hasMany(Expense, { foreignKey: 'userId', as: 'Expenses' });
  Expense.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  User.hasMany(Expense, { foreignKey: 'approvedBy', as: 'ApprovedExpenses' });
  Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });
  Driver.hasMany(Expense, { foreignKey: 'driverId', as: 'DriverExpenses' });
  Expense.belongsTo(Driver, { foreignKey: 'driverId', as: 'Driver' });
  
  // Shipment associations
  User.hasMany(Shipment, { foreignKey: 'clientId', as: 'Shipments' });
  Shipment.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });
  User.hasMany(Shipment, { foreignKey: 'pricedBy', as: 'PricedShipments' });
  Shipment.belongsTo(User, { foreignKey: 'pricedBy', as: 'Pricer' });
  Driver.hasMany(Shipment, { foreignKey: 'driverId', as: 'AssignedShipments' });
  Shipment.belongsTo(Driver, { foreignKey: 'driverId', as: 'Driver' });
  
  // Scheduled Delivery associations
  User.hasMany(ScheduledDelivery, { foreignKey: 'clientId', as: 'ScheduledDeliveries' });
  ScheduledDelivery.belongsTo(User, { foreignKey: 'clientId', as: 'Client' });
  Driver.hasMany(ScheduledDelivery, { foreignKey: 'driverId', as: 'AssignedScheduledDeliveries' });
  ScheduledDelivery.belongsTo(Driver, { foreignKey: 'driverId', as: 'Driver' });
  User.hasMany(ScheduledDelivery, { foreignKey: 'approvedBy', as: 'ApprovedScheduledDeliveries' });
  ScheduledDelivery.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });

  // Announcement associations
  User.hasMany(Announcement, { foreignKey: 'sentBy', as: 'SentAnnouncements' });
  Announcement.belongsTo(User, { foreignKey: 'sentBy', as: 'Sender' });
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
  DeliveryRequest,
  ClientStorage,
  Expense,
  Shipment,
  ScheduledDelivery,
  FinancialRecord,
  Announcement
};
