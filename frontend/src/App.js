/**
 * Main App Component
 * Root component for the application
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import PackagesPage from './pages/PackagesPage';
import DriversPage from './pages/DriversPage';
import RoutesPage from './pages/RoutesPage';
import StockPage from './pages/StockPage';
import OptimizationPage from './pages/OptimizationPage';
import './App.css';

// Root redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'driver') {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/packages" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <PackagesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/drivers" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <DriversPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/routes" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <RoutesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/stock" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <StockPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/optimization" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <OptimizationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/driver/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={<RootRedirect />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
