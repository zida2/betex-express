/**
 * API Service
 * Axios instance for API calls with retry logic and error handling
 */

import axios from 'axios';
import * as mockData from './mockData';

// Demo mode
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';
const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

console.log('[API] DEMO_MODE:', DEMO_MODE);
console.log('[API] API_URL:', API_URL);
console.log('[API] REACT_APP_DEMO_MODE env:', process.env.REACT_APP_DEMO_MODE);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request counter for deduplication
const requestMap = new Map();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for deduplication
    config.requestId = `${config.method}:${config.url}`;
    
    // Abort previous identical request
    if (requestMap.has(config.requestId)) {
      const previousController = requestMap.get(config.requestId);
      previousController.abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    requestMap.set(config.requestId, controller);

    // Mark for demo mode handling
    if (DEMO_MODE) {
      config.demoMode = true;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Clean up request map
    if (response.config.requestId) {
      requestMap.delete(response.config.requestId);
    }
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url || '';
    const isDemoMode = error.config?.demoMode === true;

    // In DEMO_MODE, handle ALL failed requests by returning mock data
    if (isDemoMode) {
      console.log(`Demo mode: Intercepting ${method} ${url}, returning mock data`);
      
      // Handle login
      if (method === 'POST' && url.includes('/auth/login')) {
        try {
          const data = typeof error.config?.data === 'string' 
            ? JSON.parse(error.config.data) 
            : error.config?.data || {};
          return mockData.mockLogin(data.email, data.password);
        } catch (e) {
          console.error('Mock login error:', e);
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
      
      // Handle dashboard overview
      if (method === 'GET' && url.includes('/dashboard/overview')) {
        return mockData.mockGetStats();
      }
      
      // Handle packages
      if (method === 'GET' && url.includes('/packages') && !url.includes('/packages/')) {
        return mockData.mockGetPackages();
      }
      
      // Handle drivers
      if (method === 'GET' && url.includes('/drivers') && !url.includes('/drivers/')) {
        return mockData.mockGetDrivers();
      }
      
      // Handle history
      if (method === 'GET' && url.includes('/history')) {
        return mockData.mockGetHistory();
      }
      
      // Handle zones
      if (method === 'GET' && url.includes('/zones')) {
        return mockData.mockGetZones();
      }
      
      // Handle routes
      if (method === 'GET' && url.includes('/routes')) {
        return mockData.mockGetRoutes();
      }
      
      // Handle stats
      if (method === 'GET' && (url.includes('/statistics') || url.includes('/stats'))) {
        return mockData.mockGetStats();
      }
      
      // Default mock response
      return Promise.resolve({
        data: {
          data: [],
          success: true
        }
      });
    }

    // Handle unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Clean up request map
    if (error.config?.requestId) {
      requestMap.delete(error.config.requestId);
    }

    return Promise.reject(error);
  }
);

// Retry logic
const retryRequest = async (config, attempt = 1, maxRetries = 3) => {
  try {
    return await api.request(config);
  } catch (error) {
    // Don't retry on 4xx errors (except 429)
    if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
      return Promise.reject(error);
    }

    // Retry with exponential backoff
    if (attempt < maxRetries && (error.code === 'ECONNABORTED' || error.response?.status === 429)) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(config, attempt + 1, maxRetries);
    }

    return Promise.reject(error);
  }
};

// Create request with auto-retry
const createRequest = (config) => {
  return retryRequest(config);
};

// API methods
export const apiMethods = {
  // Auth
  login: (email, password) => {
    if (DEMO_MODE) {
      return mockData.mockLogin(email, password);
    }
    return createRequest({
      method: 'POST',
      url: '/auth/login',
      data: { email, password }
    });
  },

  me: () => {
    if (DEMO_MODE) {
      return Promise.resolve({ data: mockData.DEMO_USERS.admin });
    }
    return createRequest({ method: 'GET', url: '/auth/me' });
  },

  logout: () =>
    createRequest({ method: 'POST', url: '/auth/logout' }),

  // Packages
  getPackages: (params) => {
    if (DEMO_MODE) {
      return mockData.mockGetPackages(params);
    }
    return createRequest({
      method: 'GET',
      url: '/packages',
      params
    });
  },

  getPackage: (id) =>
    createRequest({ method: 'GET', url: `/packages/${id}` }),

  createPackage: (data) => {
    if (DEMO_MODE) {
      return mockData.mockCreatePackage(data);
    }
    return createRequest({
      method: 'POST',
      url: '/packages',
      data
    });
  },

  updatePackage: (id, data) =>
    createRequest({
      method: 'PUT',
      url: `/packages/${id}`,
      data
    }),

  // Drivers
  getDrivers: (params) => {
    if (DEMO_MODE) {
      return mockData.mockGetDrivers();
    }
    return createRequest({
      method: 'GET',
      url: '/drivers',
      params
    });
  },

  getDriver: (id) =>
    createRequest({ method: 'GET', url: `/drivers/${id}` }),

  // Routes
  getRoutes: (params) => {
    if (DEMO_MODE) {
      return mockData.mockGetRoutes();
    }
    return createRequest({
      method: 'GET',
      url: '/routes',
      params
    });
  },

  // GPS
  updateGPS: (driverId, data) =>
    createRequest({
      method: 'POST',
      url: `/gps/update`,
      data: { driverId, ...data }
    }),

  getGPSHistory: (driverId, params) =>
    createRequest({
      method: 'GET',
      url: `/gps/${driverId}/history`,
      params
    })
};

// Direct exports for backward compatibility
export const get = (url, config) => createRequest({ method: 'GET', url, ...config });
export const post = (url, data, config) => createRequest({ method: 'POST', url, data, ...config });
export const put = (url, data, config) => createRequest({ method: 'PUT', url, data, ...config });
export const del = (url, config) => createRequest({ method: 'DELETE', url, ...config });

export default api;
