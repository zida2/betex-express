/**
 * Admin Dashboard Page
 * Main dashboard for administrators
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationCenter from '../components/NotificationCenter';
import ChatSystem from '../components/ChatSystem';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
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

      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <ChatSystem 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
          data-label="Vue d'ensemble"
          title="Vue d'ensemble"
        >
          📊<span className="nav-text"> Accueil</span>
        </button>
        <button 
          className={activeTab === 'packages' ? 'active' : ''}
          onClick={() => navigate('/admin/packages')}
          data-label="Gestion des colis"
          title="Colis"
        >
          📦<span className="nav-text"> Colis</span>
        </button>
        <button 
          className={activeTab === 'drivers' ? 'active' : ''}
          onClick={() => navigate('/admin/drivers')}
          data-label="Gestion des livreurs"
          title="Livreurs"
        >
          👨‍🚚<span className="nav-text"> Livreurs</span>
        </button>
        <button 
          className={activeTab === 'drivers-folder' ? 'active' : ''}
          onClick={() => navigate('/admin/drivers-folder')}
          data-label="Dossiers des livreurs"
          title="Dossiers"
        >
          📁<span className="nav-text"> Dossiers</span>
        </button>
        <button 
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => navigate('/admin/map')}
          data-label="Suivi GPS temps réel"
          title="Carte GPS"
        >
          🗺️<span className="nav-text"> Carte</span>
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => navigate('/admin/history')}
          data-label="Historique des livraisons"
          title="Historique"
        >
          📜<span className="nav-text"> Historique</span>
        </button>
        <button 
          className={activeTab === 'routes' ? 'active' : ''}
          onClick={() => navigate('/admin/routes')}
          data-label="Gestion des tournées"
          title="Tournées"
        >
          🚛<span className="nav-text"> Tournées</span>
        </button>
        <button 
          className={activeTab === 'stock' ? 'active' : ''}
          onClick={() => navigate('/admin/stock')}
          data-label="Gestion des stocks"
          title="Stocks"
        >
          📊<span className="nav-text"> Stocks</span>
        </button>
        <button 
          className={activeTab === 'optimization' ? 'active' : ''}
          onClick={() => navigate('/admin/optimization')}
          data-label="Optimisation des livraisons"
          title="Optimisation"
        >
          ⚡<span className="nav-text"> Optim</span>
        </button>
        <button 
          className={activeTab === 'delivery-requests' ? 'active' : ''}
          onClick={() => navigate('/admin/delivery-requests')}
          data-label="Demandes de livraison clients"
          title="Demandes clients"
        >
          📋<span className="nav-text"> Demandes</span>
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
