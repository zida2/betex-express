/**
 * Authentication Context
 * Manages user authentication state
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';
      
      if (storedToken) {
        // En mode démo, charger l'utilisateur depuis le token
        if (DEMO_MODE) {
          try {
            // Le token contient le rôle en mode démo
            if (storedToken.includes('admin')) {
              setUser({
                id: 1,
                email: 'admin@betex.com',
                name: 'Administrateur BETEX',
                role: 'admin'
              });
            } else if (storedToken.includes('driver')) {
              setUser({
                id: 2,
                email: 'livreur@betex.com',
                name: 'Jean Kouassi',
                role: 'driver'
              });
            }
          } catch (error) {
            console.error('Failed to load demo user:', error);
            localStorage.removeItem('token');
          }
        } else {
          // Mode normal avec backend
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          try {
            const response = await api.get('/auth/me');
            setUser(response.data.data);
          } catch (error) {
            console.error('Failed to load user:', error);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // En mode démo, la structure de réponse est différente
    const responseData = response.data.data || response.data;
    const accessToken = responseData.token || responseData.accessToken;
    const userData = responseData.user;
    
    // Store token
    localStorage.setItem('token', accessToken);
    if (!process.env.REACT_APP_DEMO_MODE) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // Set user immediately
    setUser(userData);
    setToken(accessToken);
    setLoading(false);
    
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { accessToken, user: newUser } = response.data.data;
    
    // Store token
    localStorage.setItem('token', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // Set user immediately
    setUser(newUser);
    setLoading(false);
    
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
