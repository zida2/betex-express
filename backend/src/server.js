/**
 * BETEX EXPRESS - Server Entry Point
 * Plateforme de gestion de livraison
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Import configuration
const logger = require('./utils/logger');
const { sequelize, Announcement } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const packageRoutes = require('./routes/packages.routes');
const driverRoutes = require('./routes/drivers.routes');
const routeRoutes = require('./routes/routes.routes');
const zoneRoutes = require('./routes/zones.routes');
const gpsRoutes = require('./routes/gps.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const stockRoutes = require('./routes/stock.routes');
const optimizationRoutes = require('./routes/optimization.routes');
const driverStatsRoutes = require('./routes/driverStats.routes');
const deliveryRequestsRoutes = require('./routes/deliveryRequests.routes');
const migrationRoutes = require('./routes/migration.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const pricingRoutes = require('./routes/pricing.routes');

// New routes for logistics platform
const clientStockRoutes = require('./routes/clientStock.routes');
const storageRoutes = require('./routes/storage.routes');
const expenseRoutes = require('./routes/expense.routes');
const shipmentRoutes = require('./routes/shipment.routes');
const scheduledDeliveryRoutes = require('./routes/scheduledDelivery.routes');
const financialRoutes = require('./routes/financial.routes');
const revenueRoutes = require('./routes/revenue.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Readiness check endpoint
app.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ready',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/driver-stats', driverStatsRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/gps', gpsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/optimization', optimizationRoutes);
app.use('/api/v1/delivery-requests', deliveryRequestsRoutes);
app.use('/api/v1/migration', migrationRoutes);

// New logistics platform routes
app.use('/api/v1/client-stock', clientStockRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/scheduled-deliveries', scheduledDeliveryRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/announcements', announcementsRoutes);
app.use('/api/v1/revenue', revenueRoutes);
app.use('/api/v1/pricing', pricingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io event handlers
require('./socket/socketHandler')(io);

// Database synchronization and server startup
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
// Redémarrage du serveur - tentative finale


const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync Announcement table (without alter to avoid constraint issues)
    try {
      await Announcement.sync();
      logger.info('Announcement table synced successfully');
    } catch (syncError) {
      logger.warn('Announcement table sync warning (continuing anyway):', syncError.message);
    }

    // Start server
    server.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Graceful shutdown initiated...');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await sequelize.close();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database:', error);
    }

    io.close();
    logger.info('Socket.io connections closed');

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

module.exports = { app, server, io };
// End of server.js