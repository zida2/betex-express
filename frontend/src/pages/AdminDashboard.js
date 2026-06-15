/**
 * Admin Dashboard Page - Android Style
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDrivers, getDeliveryRequests, listenToDeliveryRequests, listenToPackages } from '../services/firebaseService';
import '../styles/AdminDashboard.css';
import '../styles/PageLayout.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const previousRequestsLength = useRef(0);
  const previousPackagesLength = useRef(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Liste des applications (style Android)
  const apps = [
    { id: 'packages', name: 'Colis', icon: '📦', path: '/admin/packages', color: '#0066ff' },
    { id: 'drivers', name: 'Livreurs', icon: '👨‍🚚', path: '/admin/drivers', color: '#00c853' },
    { id: 'requests', name: 'Demandes', icon: '📋', path: '/admin/delivery-requests', color: '#ff1744', badge: unreadRequests },
    { id: 'routes', name: 'Tournées', icon: '🚛', path: '/admin/routes', color: '#aa00ff' },
    { id: 'tracking', name: 'Suivi GPS', icon: '🗺️', path: '/admin/map', color: '#00bfa5' },
    { id: 'pricing', name: 'Tarifs', icon: '💰', path: '/admin/pricing', color: '#ff9100' },
    { id: 'stock', name: 'Stocks', icon: '📊', path: '/admin/stock', color: '#37474f' },
    { id: 'history', name: 'Historique', icon: '📜', path: '/admin/history', color: '#00b8d4' },
    { id: 'announcements', name: 'Annonces', icon: '📢', path: '/admin/announcements', color: '#651fff' },
    { id: 'optimization', name: 'Optimiser', icon: '⚡', path: '/admin/optimization', color: '#ff6d00' },
    { id: 'revenue', name: 'Chiffre', icon: '📈', path: '/admin/revenue', color: '#00e676' },
    { id: 'quartiers', name: 'Quartiers', icon: '🗺️', path: '/admin/quartier-dashboard', color: '#2962ff' },
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time listeners
    const unsubscribeRequests = listenToDeliveryRequests((requests) => {
      setAllRequests(requests);
      
      // Check for new requests
      if (previousRequestsLength.current > 0 && requests.length > previousRequestsLength.current) {
        const newRequest = requests[0]; // Most recent
        addNotification({
          id: Date.now(),
          icon: '📋',
          title: 'Nouvelle demande de livraison !',
          message: `${newRequest.senderName} a envoyé une demande`,
          time: 'À l\'instant',
          type: 'new'
        });
      }
      previousRequestsLength.current = requests.length;
      
      // Update unread count
      const pending = requests.filter(r => r.status === 'pending');
      setUnreadRequests(pending.length);
    });
    
    const unsubscribePackages = listenToPackages((packages) => {
      setAllPackages(packages);
      
      // Check for delivered packages
      const deliveredPackages = packages.filter(p => p.status === 'delivered');
      if (previousPackagesLength.current > 0 && deliveredPackages.length > 0) {
        // Find the latest delivered one
        const latestDelivered = deliveredPackages.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return timeB - timeA;
        })[0];
        
        addNotification({
          id: Date.now() + 1,
          icon: '📦',
          title: 'Colis livré !',
          message: `${latestDelivered.recipientName} a reçu son colis`,
          time: 'À l\'instant',
          type: 'success'
        });
      }
      previousPackagesLength.current = packages.length;
    });
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeRequests();
      unsubscribePackages();
    };
  }, []);

  const addNotification = (newNotification) => {
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10
  };

  const loadDashboardData = async () => {
    try {
      const [drivers, requests] = await Promise.all([getDrivers(), getDeliveryRequests()]);
      const statsData = {
        totalDrivers: drivers.length,
        totalDeliveryRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        todayRevenue: 0
      };
      setStats(statsData);
      
      // Initial notifications
      const initialNotifications = [];
      
      if (statsData.pendingRequests > 0) {
        initialNotifications.push({
          id: 1,
          icon: '📋',
          title: `Nouvelle demande de livraison`,
          message: `${statsData.pendingRequests} demande(s) en attente d'approbation`,
          time: 'Il y a quelques minutes',
          type: 'pending'
        });
      }
      
      if (statsData.totalDrivers > 0) {
        initialNotifications.push({
          id: 2,
          icon: '👨‍🚚',
          title: `${statsData.totalDrivers} livreur(s) actif(s)`,
          message: 'Tous les livreurs sont prêts à travailler',
          time: 'Il y a 5 min',
          type: 'info'
        });
      }
      
      initialNotifications.push({
        id: 3,
        icon: '💳',
        title: 'Revenus du jour',
        message: 'Vérifiez le chiffre d\'affaires quotidien',
        time: 'Il y a 10 min',
        type: 'success'
      });
      
      setNotifications(initialNotifications);
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
    <div className="page-layout admin-dashboard android-style">
      {/* Barre de statut Android */}
      <header className="android-header">
        <div className="android-header-left">
          <span className="android-logo">🛵 BETEX</span>
        </div>
        <div className="android-header-right">
          <button 
            className="android-notif-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadRequests > 0 && (
              <span className="android-notif-badge">{unreadRequests}</span>
            )}
          </button>
          <div className="android-user">
            <span>{user?.firstName || 'Admin'}</span>
          </div>
          <button onClick={handleLogout} className="android-logout">
            ⚙️
          </button>
        </div>
      </header>

      {/* Panneau de notifications */}
      {showNotifications && (
        <div className="android-notif-panel">
          <div className="android-notif-header">
            <h4>Notifications</h4>
            <button onClick={() => setShowNotifications(false)} className="android-close">✕</button>
          </div>
          <div className="android-notif-list">
            {notifications.length === 0 ? (
              <div className="android-notif-empty">
                <p>Aucune notification pour le moment</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`android-notif-item ${notif.type || 'default'}`}
                  onClick={() => {
                    // Naviguer vers la page appropriée
                    if (notif.type === 'pending') {
                      navigate('/admin/delivery-requests');
                    } else if (notif.icon === '👨‍🚚') {
                      navigate('/admin/drivers');
                    } else if (notif.icon === '💳') {
                      navigate('/admin/revenue');
                    }
                    setShowNotifications(false);
                  }}
                >
                  <span className="android-notif-icon">{notif.icon}</span>
                  <div className="android-notif-text">
                    <p className="android-notif-title">{notif.title}</p>
                    <span className="android-notif-time">{notif.message}</span>
                    <span className="android-notif-date">{notif.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Zone principale Android */}
      <main className="android-main">
        {/* Widgets rapides */}
        <div className="android-widgets">
          <div className="android-widget">
            <span className="android-widget-icon">📦</span>
            <span className="android-widget-value">{stats?.totalDeliveryRequests || 0}</span>
            <span className="android-widget-label">Demandes</span>
          </div>
          <div className="android-widget">
            <span className="android-widget-icon">👨‍🚚</span>
            <span className="android-widget-value">{stats?.totalDrivers || 0}</span>
            <span className="android-widget-label">Livreurs</span>
          </div>
          <div className="android-widget">
            <span className="android-widget-icon">⏳</span>
            <span className="android-widget-value">{stats?.pendingRequests || 0}</span>
            <span className="android-widget-label">En attente</span>
          </div>
        </div>

        {/* Grille d'applications */}
        <div className="android-apps-grid">
          {apps.map(app => (
            <div 
              key={app.id} 
              className="android-app-icon" 
              onClick={() => navigate(app.path)}
            >
              <div className="android-app-circle" style={{ background: app.color }}>
                <span className="android-app-emoji">{app.icon}</span>
              </div>
              <span className="android-app-name">{app.name}</span>
              {app.badge > 0 && (
                <span className="android-app-badge">{app.badge}</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
