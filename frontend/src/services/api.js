/**
 * API Service
 * Axios instance for API calls with retry logic and error handling
 */

import axios from 'axios';
import * as mockData from './mockData';

// Demo mode
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';
const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

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

// Demo mode wrapper
const wrapDemoMode = (demoKey, realRequest) => {
  return async (...args) => {
    if (DEMO_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const demoData = mockData[demoKey];
          if (demoData) {
            resolve({ data: demoData });
          } else {
            resolve({ data: { data: [] } });
          }
        }, 300);
      });
    }
    return realRequest(...args);
  };
};

// API methods
export const apiMethods = {
  // Auth
  login: wrapDemoMode('loginUser', (email, password) =>
    createRequest({
      method: 'POST',
      url: '/auth/login',
      data: { email, password }
    })
  ),

  me: wrapDemoMode('currentUser', () =>
    createRequest({ method: 'GET', url: '/auth/me' })
  ),

  logout: () =>
    createRequest({ method: 'POST', url: '/auth/logout' }),

  // Packages
  getPackages: wrapDemoMode('packagesList', (params) =>
    createRequest({
      method: 'GET',
      url: '/packages',
      params
    })
  ),

  getPackage: (id) =>
    createRequest({ method: 'GET', url: `/packages/${id}` }),

  createPackage: (data) =>
    createRequest({
      method: 'POST',
      url: '/packages',
      data
    }),

  updatePackage: (id, data) =>
    createRequest({
      method: 'PUT',
      url: `/packages/${id}`,
      data
    }),

  // Drivers
  getDrivers: wrapDemoMode('driversList', (params) =>
    createRequest({
      method: 'GET',
      url: '/drivers',
      params
    })
  ),

  getDriver: (id) =>
    createRequest({ method: 'GET', url: `/drivers/${id}` }),

  // Routes
  getRoutes: wrapDemoMode('routesList', (params) =>
    createRequest({
      method: 'GET',
      url: '/routes',
      params
    })
  ),

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
