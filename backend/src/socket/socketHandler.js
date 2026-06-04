/**
 * Socket.io Event Handler
 * Real-time communication setup
 */

const logger = require('../utils/logger');
const { GPSPosition, Driver, Package } = require('../models');

const socketHandler = (io) => {
  // Admin namespace
  const adminNamespace = io.of('/admin');
  const driverNamespace = io.of('/driver');

  // Store connected drivers
  const connectedDrivers = new Map();

  // Admin connections
  adminNamespace.on('connection', (socket) => {
    logger.info('Admin connected:', socket.id);

    // Join tracking room to receive driver updates
    socket.join('tracking');
    logger.info('Admin joined tracking room');

    // Request to track specific driver
    socket.on('track:driver', ({ driverId }) => {
      socket.join(`driver:${driverId}`);
      logger.info(`Admin tracking driver: ${driverId}`);
    });

    // Stop tracking specific driver
    socket.on('untrack:driver', ({ driverId }) => {
      socket.leave(`driver:${driverId}`);
      logger.info(`Admin stopped tracking driver: ${driverId}`);
    });

    // Get list of online drivers
    socket.on('drivers:online', () => {
      const onlineDrivers = Array.from(connectedDrivers.entries()).map(([id, data]) => ({
        driverId: id,
        ...data
      }));
      socket.emit('drivers:online_list', onlineDrivers);
    });

    socket.on('disconnect', () => {
      logger.info('Admin disconnected:', socket.id);
    });
  });

  // Driver connections
  driverNamespace.on('connection', async (socket) => {
    const driverId = socket.handshake.auth.driverId;
    
    if (!driverId) {
      logger.warn('Driver connected without driverId');
      socket.disconnect();
      return;
    }

    logger.info('Driver connected:', driverId);

    // Store driver connection
    connectedDrivers.set(driverId, {
      socketId: socket.id,
      connectedAt: new Date(),
      lastUpdate: new Date()
    });

    // Update driver status to online
    try {
      await Driver.update(
        { status: 'online' },
        { where: { id: driverId } }
      );

      // Notify admins
      adminNamespace.to('tracking').emit('driver:connected', {
        driverId,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error updating driver status:', error);
    }

    // Join driver's personal room
    socket.join(`driver:${driverId}`);

    // Handle GPS position updates
    socket.on('position:update', async (data) => {
      try {
        const { latitude, longitude, accuracy, speed, heading } = data;

        // Save position to database
        await GPSPosition.create({
          driverId,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date()
        });

        // Update driver's last position
        await Driver.update(
          {
            lastLatitude: latitude,
            lastLongitude: longitude,
            lastPositionUpdate: new Date()
          },
          { where: { id: driverId } }
        );

        // Update connected driver data
        if (connectedDrivers.has(driverId)) {
          connectedDrivers.get(driverId).lastUpdate = new Date();
        }

        // Broadcast to admins tracking this driver
        adminNamespace.to('tracking').emit('driver:position_updated', {
          driverId,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date()
        });

        logger.info(`Position updated for driver ${driverId}`);
      } catch (error) {
        logger.error('Error handling position update:', error);
        socket.emit('error', { message: 'Failed to update position' });
      }
    });

    // Handle driver status updates
    socket.on('status:update', async (data) => {
      try {
        const { status } = data;

        await Driver.update(
          { status },
          { where: { id: driverId } }
        );

        // Broadcast to admins
        adminNamespace.to('tracking').emit('driver:status_changed', {
          driverId,
          status,
          timestamp: new Date()
        });

        logger.info(`Status updated for driver ${driverId}: ${status}`);
      } catch (error) {
        logger.error('Error handling status update:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle package status updates
    socket.on('package:status_update', async (data) => {
      try {
        const { packageId, status, notes } = data;

        const pkg = await Package.findByPk(packageId);
        if (!pkg) {
          socket.emit('error', { message: 'Package not found' });
          return;
        }

        await pkg.update({ status, notes });

        // Broadcast to admins
        adminNamespace.to('tracking').emit('package:status_changed', {
          packageId,
          driverId,
          status,
          notes,
          timestamp: new Date()
        });

        // Confirm to driver
        socket.emit('package:status_updated', {
          packageId,
          status,
          timestamp: new Date()
        });

        logger.info(`Package ${packageId} status updated by driver ${driverId}: ${status}`);
      } catch (error) {
        logger.error('Error handling package status update:', error);
        socket.emit('error', { message: 'Failed to update package status' });
      }
    });

    // Handle driver disconnect
    socket.on('disconnect', async () => {
      logger.info('Driver disconnected:', driverId);

      // Remove from connected drivers
      connectedDrivers.delete(driverId);

      // Update driver status to offline
      try {
        await Driver.update(
          { status: 'offline' },
          { where: { id: driverId } }
        );

        // Notify admins
        adminNamespace.to('tracking').emit('driver:disconnected', {
          driverId,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Error updating driver status on disconnect:', error);
      }
    });
  });

  // Utility function to emit to specific driver
  io.emitToDriver = (driverId, event, data) => {
    driverNamespace.to(`driver:${driverId}`).emit(event, data);
  };

  // Utility function to emit to all admins
  io.emitToAdmins = (event, data) => {
    adminNamespace.to('tracking').emit(event, data);
  };

  logger.info('Socket.io namespaces configured with real-time handlers');
};

module.exports = socketHandler;
