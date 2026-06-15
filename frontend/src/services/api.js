/**
 * API Service - FIREBASE MODE
 * Uses Firebase Firestore directly
 */

import * as firebaseService from './firebaseService';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

console.log('[API] 🔥 FIREBASE MODE - Using Firestore');

// API Methods
export const apiMethods = {
  // Authentication
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { data: { data: { id: user.uid, email: user.email } } };
  },

  register: async (email, password, firstName, lastName, phone) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userData = {
      email,
      firstName,
      lastName,
      phone,
      name: `${firstName} ${lastName}`,
      role: 'client'
    };
    await setDoc(doc(db, 'users', user.uid), userData);
    return { data: { data: { id: user.uid, ...userData } } };
  },

  refresh: () => Promise.resolve({ data: { data: { accessToken: null } } }),

  me: async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not logged in');
    const userDoc = await firebaseService.getUser(currentUser.uid);
    return { data: { data: userDoc } };
  },

  logout: async () => {
    await signOut(auth);
    return { data: { data: { success: true } } };
  },

  // Delivery Requests
  createDeliveryRequest: async (data) => {
    const result = await firebaseService.createDeliveryRequest(data);
    return { data: { data: result } };
  },

  getDeliveryRequests: async (params) => {
    const result = await firebaseService.getDeliveryRequests(params);
    return { data: { data: result } };
  },

  getDeliveryRequest: async (id) => {
    const result = await firebaseService.getDeliveryRequest(id);
    return { data: { data: result } };
  },

  approveDeliveryRequest: async (id, data) => {
    const result = await firebaseService.updateDeliveryRequest(id, { status: 'approved', ...data });
    return { data: { data: result } };
  },

  rejectDeliveryRequest: async (id, rejectionReason) => {
    const result = await firebaseService.updateDeliveryRequest(id, { status: 'rejected', rejectionReason });
    return { data: { data: result } };
  },

  // Drivers
  getDrivers: async (params) => {
    const result = await firebaseService.getDrivers(params);
    return { data: { data: result } };
  },

  getDriver: async (id) => {
    const result = await firebaseService.getUser(id);
    return { data: { data: result } };
  },

  getDriverStats: async (id) => {
    return { data: { data: { totalDeliveries: 0, revenue: 0 } } };
  },

  createDriver: async (data) => {
    const result = await firebaseService.createUser({ ...data, role: 'driver' });
    return { data: { data: result } };
  },

  updateDriverStatus: async (id, status) => {
    const result = await firebaseService.updateUser(id, { status });
    return { data: { data: result } };
  },

  // Zones
  getZones: async (params) => {
    const result = await firebaseService.getZones(params);
    return { data: { data: result } };
  },

  createZone: async (data) => {
    const result = await firebaseService.createZone(data);
    return { data: { data: result } };
  },

  updateZone: async (id, data) => {
    return { data: { data: { id, ...data } } };
  },

  deleteZone: async (id) => {
    return { data: { data: { id } } };
  },

  // Pricing
  getPricing: async () => {
    const result = await firebaseService.getPricing();
    return { data: { data: result } };
  },

  updatePricing: async (data) => {
    const result = await firebaseService.updatePricing(data);
    return { data: { data: result } };
  },

  calculateExpressPrice: async (distance) => {
    const basePrice = 1000;
    const perKmPrice = 500;
    const price = basePrice + (distance * perKmPrice);
    return { data: { data: { price } } };
  },

  // Revenue
  getDailyRevenue: async (params) => {
    return { data: { data: [] } };
  },

  getMonthlyRevenue: async (params) => {
    return { data: { data: [] } };
  },

  // Dashboard
  getDashboardOverview: async () => {
    const drivers = await firebaseService.getDrivers();
    const requests = await firebaseService.getDeliveryRequests();
    return {
      data: {
        data: {
          totalDrivers: drivers.length,
          totalDeliveryRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          todayRevenue: 0
        }
      }
    };
  },

  // GPS
  updateGPSPosition: async (data) => {
    return { data: { data: { success: true } } };
  },

  getCurrentDriverLocations: async (params) => {
    return { data: { data: [] } };
  },

  getDriverGPSHistory: async (driverId, params) => {
    return { data: { data: [] } };
  }
};

// Add direct methods on apiMethods for compatibility
apiMethods.get = async (url, config) => {
  if (url === '/dashboard/overview') return apiMethods.getDashboardOverview();
  if (url === '/delivery-requests') return apiMethods.getDeliveryRequests(config?.params);
  if (url.startsWith('/delivery-requests/')) return apiMethods.getDeliveryRequest(url.split('/')[2]);
  if (url === '/drivers') return apiMethods.getDrivers(config?.params);
  if (url.startsWith('/drivers/') && url.endsWith('/stats')) return apiMethods.getDriverStats(url.split('/')[2]);
  if (url === '/zones') return apiMethods.getZones(config?.params);
  if (url === '/pricing') return apiMethods.getPricing();
  if (url === '/auth/me') return apiMethods.me();
  return { data: { data: [] } };
};

apiMethods.post = async (url, data, config) => {
  if (url === '/auth/login') return apiMethods.login(data.email, data.password);
  if (url === '/auth/register') return apiMethods.register(data.email, data.password, data.firstName, data.lastName, data.phone);
  if (url === '/auth/logout') return apiMethods.logout();
  if (url === '/delivery-requests') return apiMethods.createDeliveryRequest(data);
  if (url.startsWith('/delivery-requests/') && url.endsWith('/approve')) return apiMethods.approveDeliveryRequest(url.split('/')[2], data);
  if (url.startsWith('/delivery-requests/') && url.endsWith('/reject')) return apiMethods.rejectDeliveryRequest(url.split('/')[2], data.rejectionReason);
  if (url === '/drivers') return apiMethods.createDriver(data);
  if (url === '/zones') return apiMethods.createZone(data);
  if (url === '/pricing/calculate-express') return apiMethods.calculateExpressPrice(data.distance);
  if (url === '/gps/update') return apiMethods.updateGPSPosition(data);
  return { data: { data: {} } };
};

apiMethods.put = async (url, data, config) => {
  if (url === '/pricing') return apiMethods.updatePricing(data);
  if (url.startsWith('/zones/')) return apiMethods.updateZone(url.split('/')[2], data);
  if (url.startsWith('/drivers/') && url.endsWith('/status')) return apiMethods.updateDriverStatus(url.split('/')[2], data.status);
  return { data: { data: {} } };
};

apiMethods.delete = async (url, config) => {
  if (url.startsWith('/zones/')) return apiMethods.deleteZone(url.split('/')[2]);
  return { data: { data: {} } };
};

// Direct exports for backward compatibility
export const get = apiMethods.get;
export const post = apiMethods.post;
export const put = apiMethods.put;
export const del = apiMethods.delete;

export default apiMethods;
