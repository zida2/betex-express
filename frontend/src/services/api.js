/**
 * API Service
 * Axios instance for API calls with Demo Mode support
 */

import axios from 'axios';
import * as mockData from './mockData';

// Demo mode activé si REACT_APP_DEMO_MODE=true
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Use relative path so Nginx proxy handles it
const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Gestion des requêtes en mode démo
const handleDemoRequest = async (method, url, data) => {
  console.log(`🎭 MODE DÉMO: ${method} ${url}`);
  
  // Routes de login
  if (url.includes('/auth/login')) {
    return { data: await mockData.mockLogin(data.email, data.password) };
  }
  
  // Dashboard stats et overview
  if (url.includes('/dashboard/stats') || url.includes('/dashboard/overview')) {
    return { data: await mockData.mockGetStats() };
  }
  
  // Packages
  if (url.includes('/packages') && method === 'GET') {
    return { data: await mockData.mockGetPackages() };
  }
  if (url.includes('/packages') && method === 'POST') {
    return { data: await mockData.mockCreatePackage(data) };
  }
  
  // Drivers
  if (url.includes('/drivers')) {
    return { data: await mockData.mockGetDrivers() };
  }
  
  // Suggest driver
  if (url.includes('/optimization/suggest-driver')) {
    return { data: await mockData.mockSuggestDriver(data) };
  }
  
  // Zones
  if (url.includes('/zones')) {
    return { data: await mockData.mockGetZones() };
  }
  
  // Default response
  return { data: { success: true, message: 'Mode démo actif' } };
};

// Wrapper pour activer le mode démo
const apiWithDemo = {
  // Exposer les propriétés de base d'axios
  defaults: api.defaults,
  interceptors: api.interceptors,
  
  get: async (url, config) => {
    if (DEMO_MODE) {
      return handleDemoRequest('GET', url);
    }
    return api.get(url, config);
  },
  post: async (url, data, config) => {
    if (DEMO_MODE) {
      return handleDemoRequest('POST', url, data);
    }
    return api.post(url, data, config);
  },
  put: async (url, data, config) => {
    if (DEMO_MODE) {
      return handleDemoRequest('PUT', url, data);
    }
    return api.put(url, data, config);
  },
  delete: async (url, config) => {
    if (DEMO_MODE) {
      return handleDemoRequest('DELETE', url);
    }
    return api.delete(url, config);
  },
  patch: async (url, data, config) => {
    if (DEMO_MODE) {
      return handleDemoRequest('PATCH', url, data);
    }
    return api.patch(url, data, config);
  }
};

export default apiWithDemo;
