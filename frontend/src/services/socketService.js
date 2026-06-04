/**
 * Socket.io Service
 * Real-time communication setup
 */

import { io } from 'socket.io-client';

// Use empty string to connect to same origin (works with nginx proxy)
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';

class SocketService {
  constructor() {
    this.adminSocket = null;
    this.driverSocket = null;
  }

  /**
   * Connect as admin
   */
  connectAdmin() {
    if (this.adminSocket?.connected) return;

    this.adminSocket = io(`${SOCKET_URL}/admin`, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.adminSocket.on('connect', () => {
      console.log('Admin socket connected');
    });

    this.adminSocket.on('disconnect', () => {
      console.log('Admin socket disconnected');
    });

    this.adminSocket.on('error', (error) => {
      console.error('Admin socket error:', error);
    });

    return this.adminSocket;
  }

  /**
   * Connect as driver
   */
  connectDriver(driverId) {
    if (this.driverSocket?.connected) return;

    this.driverSocket = io(`${SOCKET_URL}/driver`, {
      auth: {
        token: localStorage.getItem('token'),
        driverId
      }
    });

    this.driverSocket.on('connect', () => {
      console.log('Driver socket connected');
    });

    this.driverSocket.on('disconnect', () => {
      console.log('Driver socket disconnected');
    });

    this.driverSocket.on('error', (error) => {
      console.error('Driver socket error:', error);
    });

    return this.driverSocket;
  }

  /**
   * Send GPS position (driver)
   */
  sendPosition(positionData) {
    if (this.driverSocket?.connected) {
      this.driverSocket.emit('position:update', positionData);
    }
  }

  /**
   * Update driver status
   */
  updateStatus(status) {
    if (this.driverSocket?.connected) {
      this.driverSocket.emit('status:update', { status });
    }
  }

  /**
   * Update package status (driver)
   */
  updatePackageStatus(packageId, status, notes = '') {
    if (this.driverSocket?.connected) {
      this.driverSocket.emit('package:status_update', {
        packageId,
        status,
        notes
      });
    }
  }

  /**
   * Subscribe to driver position updates (admin)
   */
  onDriverPositionUpdate(callback) {
    if (this.adminSocket) {
      this.adminSocket.on('driver:position_updated', callback);
    }
  }

  /**
   * Subscribe to driver status changes (admin)
   */
  onDriverStatusChange(callback) {
    if (this.adminSocket) {
      this.adminSocket.on('driver:status_changed', callback);
    }
  }

  /**
   * Subscribe to package status changes (admin)
   */
  onPackageStatusChange(callback) {
    if (this.adminSocket) {
      this.adminSocket.on('package:status_changed', callback);
    }
  }

  /**
   * Subscribe to driver connections (admin)
   */
  onDriverConnected(callback) {
    if (this.adminSocket) {
      this.adminSocket.on('driver:connected', callback);
    }
  }

  /**
   * Subscribe to driver disconnections (admin)
   */
  onDriverDisconnected(callback) {
    if (this.adminSocket) {
      this.adminSocket.on('driver:disconnected', callback);
    }
  }

  /**
   * Get list of online drivers (admin)
   */
  getOnlineDrivers(callback) {
    if (this.adminSocket) {
      this.adminSocket.emit('drivers:online');
      this.adminSocket.once('drivers:online_list', callback);
    }
  }

  /**
   * Track specific driver (admin)
   */
  trackDriver(driverId) {
    if (this.adminSocket) {
      this.adminSocket.emit('track:driver', { driverId });
    }
  }

  /**
   * Stop tracking driver (admin)
   */
  untrackDriver(driverId) {
    if (this.adminSocket) {
      this.adminSocket.emit('untrack:driver', { driverId });
    }
  }

  /**
   * Disconnect all sockets
   */
  disconnect() {
    if (this.adminSocket) {
      this.adminSocket.disconnect();
      this.adminSocket = null;
    }
    if (this.driverSocket) {
      this.driverSocket.disconnect();
      this.driverSocket = null;
    }
  }
}

export default new SocketService();
