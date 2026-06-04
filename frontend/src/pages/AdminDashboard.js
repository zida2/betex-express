/**
 * Admin Dashboard Page
 * Main dashboard for administrators
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AdminDashboard.css';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/overview');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🛵 BETEX EXPRESS</h1>
          <span className="user-info">Admin: {user?.firstName || user?.email}</span>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Vue d'ensemble
        </button>
        <button 
          className={activeTab === 'packages' ? 'active' : ''}
          onClick={() => navigate('/admin/packages')}
        >
          📦 Colis
        </button>
        <button 
          className={activeTab === 'drivers' ? 'active' : ''}
          onClick={() => navigate('/admin/drivers')}
        >
          👨‍🚚 Livreurs
        </button>
        <button 
          className={activeTab === 'routes' ? 'active' : ''}
          onClick={() => navigate('/admin/routes')}
        >
          🗺️ Tournées
        </button>
        <button 
          className={activeTab === 'stock' ? 'active' : ''}
          onClick={() => navigate('/admin/stock')}
        >
          📊 Stocks
        </button>
        <button 
          className={activeTab === 'optimization' ? 'active' : ''}
          onClick={() => navigate('/admin/optimization')}
        >
          ⚡ Optimisation
        </button>
      </nav>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Total Colis</h3>
              <p className="stat-value">{stats?.totalPackages || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Livrés</h3>
              <p className="stat-value">{stats?.packagesByStatus?.delivered || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚚</div>
            <div className="stat-info">
              <h3>En livraison</h3>
              <p className="stat-value">{stats?.packagesByStatus?.in_delivery || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>En attente</h3>
              <p className="stat-value">{stats?.packagesByStatus?.pending || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🚚</div>
            <div className="stat-info">
              <h3>Total Livreurs</h3>
              <p className="stat-value">{stats?.totalDrivers || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <h3>Livreurs Actifs</h3>
              <p className="stat-value">{stats?.activeDrivers || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Taux de réussite</h3>
              <p className="stat-value">{stats?.completionRate || 0}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>Échecs</h3>
              <p className="stat-value">{stats?.packagesByStatus?.delivery_failed || 0}</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Actions rapides</h2>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/packages')}
            >
              <span className="action-icon">➕</span>
              <span>Nouveau colis</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/routes')}
            >
              <span className="action-icon">🗺️</span>
              <span>Créer tournée</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/drivers')}
            >
              <span className="action-icon">👤</span>
              <span>Ajouter livreur</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/stock')}
            >
              <span className="action-icon">📊</span>
              <span>Gérer stocks</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/optimization')}
            >
              <span className="action-icon">⚡</span>
              <span>Optimiser livraisons</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
