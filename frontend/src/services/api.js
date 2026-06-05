/**
 * API Service - DEMO MODE FORCED
 * Returns mock data directly without calling backend
 */

import axios from 'axios';
import * as mockData from './mockData';

const DEMO_MODE = true;
const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

console.log('[API] ✅ DEMO MODE FORCED - All requests return mock data');

// Create axios instance (not really used in demo mode)
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Main request handler - Returns mock data immediately
const handleDemoRequest = async (method, url, data = null, params = null) => {
  console.log(`[DEMO] ${method} ${url}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Route to correct mock function
  if (method === 'POST' && url.includes('/auth/login')) {
    try {
      return await mockData.mockLogin(data.email, data.password);
    } catch (e) {
      // Return default admin user on error
      return Promise.resolve({
        data: {
          data: {
            user: mockData.DEMO_USERS.admin,
            token: mockData.DEMO_USERS.admin.token
          }
        }
      });
    }
  }

  if (method === 'GET' && url.includes('/dashboard/overview')) {
    return await mockData.mockGetStats();
  }

  if (method === 'GET' && url.includes('/packages') && !url.includes('/packages/')) {
    return await mockData.mockGetPackages(params);
  }

  if (method === 'GET' && url.includes('/drivers') && !url.includes('/drivers/')) {
    return await mockData.mockGetDrivers();
  }

  if (method === 'GET' && url.includes('/history')) {
    return await mockData.mockGetHistory(params);
  }

  if (method === 'GET' && url.includes('/zones')) {
    return await mockData.mockGetZones();
  }

  if (method === 'GET' && url.includes('/routes')) {
    return await mockData.mockGetRoutes();
  }

  if (method === 'GET' && url.includes('/delivery-requests') && !url.includes('/delivery-requests/')) {
    return await mockData.mockGetDeliveryRequests(params);
  }

  if (method === 'POST' && url.includes('/delivery-requests') && !url.includes('/delivery-requests/')) {
    return await mockData.mockCreateDeliveryRequest(data);
  }

  if (method === 'POST' && url.includes('/delivery-requests/') && url.includes('/approve')) {
    const requestId = url.split('/')[url.split('/').length - 2];
    return await mockData.mockApproveDeliveryRequest(requestId, data);
  }

  if (method === 'POST' && url.includes('/delivery-requests/') && url.includes('/reject')) {
    const requestId = url.split('/')[url.split('/').length - 2];
    return await mockData.mockRejectDeliveryRequest(requestId, data.rejectionReason);
  }

  if (method === 'POST' && url.includes('/delivery-requests/') && url.includes('/send-message')) {
    const requestId = url.split('/')[url.split('/').length - 2];
    return await mockData.mockSendMessageToClient(requestId, data.clientMessage, data.messageType);
  }

  if (method === 'GET' && url.includes('/delivery-requests/available/drivers')) {
    return await mockData.mockGetAvailableDrivers();
  }
};

// Override axios methods for demo mode
if (DEMO_MODE) {
  api.get = (url, config = {}) => {
    return handleDemoRequest('GET', url, null, config.params);
  };

  api.post = (url, data, config = {}) => {
    return handleDemoRequest('POST', url, data, config.params);
  };

  api.put = (url, data, config = {}) => {
    return handleDemoRequest('PUT', url, data, config.params);
  };

  api.delete = (url, config = {}) => {
    return handleDemoRequest('DELETE', url, null, config.params);
  };

  api.request = (config) => {
    return handleDemoRequest(config.method, config.url, config.data, config.params);
  };
}

// API Methods
export const apiMethods = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),

  me: () => 
    api.get('/auth/me'),

  logout: () => 
    api.post('/auth/logout'),

  getPackages: (params) => 
    api.get('/packages', { params }),

  getPackage: (id) => 
    api.get(`/packages/${id}`),

  createPackage: (data) => 
    api.post('/packages', data),

  updatePackage: (id, data) => 
    api.put(`/packages/${id}`, data),

  getDrivers: (params) => 
    api.get('/drivers', { params }),

  getDriver: (id) => 
    api.get(`/drivers/${id}`),

  getRoutes: (params) => 
    api.get('/routes', { params }),

  updateGPS: (driverId, data) => 
    api.post('/gps/update', { driverId, ...data }),

  getGPSHistory: (driverId, params) => 
    api.get(`/gps/${driverId}/history`, { params })
};

// Direct exports for backward compatibility
export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
