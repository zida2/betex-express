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
import DriverHistoryPage from './pages/DriverHistoryPage';
import DriverStatsPage from './pages/DriverStatsPage';
import DriverMapPage from './pages/DriverMapPage';
import PackagesPage from './pages/PackagesPage';
import DriversPage from './pages/DriversPage';
import RoutesPage from './pages/RoutesPage';
import StockPage from './pages/StockPage';
import OptimizationPage from './pages/OptimizationPage';
import MapTrackingPage from './pages/MapTrackingPage';
import DriverFolderPage from './pages/DriverFolderPage';
import HistoryPage from './pages/HistoryPage';
import ClientPortal from './pages/ClientPortal';
import DeliveryRequestsPage from './pages/DeliveryRequestsPage';
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
        path="/admin/map" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <MapTrackingPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/history" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <HistoryPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/drivers-folder" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <DriverFolderPage />
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
        path="/driver/history" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverHistoryPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/driver/stats" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverStatsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/driver/map/:packageId" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverMapPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/delivery-requests" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'dispatcher']}>
            <DeliveryRequestsPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/client" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientPortal />
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
