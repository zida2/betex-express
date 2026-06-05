/**
 * Driver Dashboard Page
 * Dashboard for delivery drivers
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socketService from '../services/socketService';
import '../styles/DriverDashboard.css';
import '../styles/DriverDashboard.css';

const DriverDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('offline');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDriverData();
    connectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDriverData = async () => {
    try {
      // Load only active packages (collected and in_delivery)
      const packagesResponse = await api.get('/packages', {
        params: { driverId: user.id, status: 'collected,in_delivery' }
      });
      
      const data = packagesResponse.data.data;
      // Filter to ensure we only have active deliveries
      const activePackages = (Array.isArray(data) ? data : []).filter(pkg => 
        pkg.status === 'collected' || pkg.status === 'in_delivery'
      );
      setPackages(activePackages);

      // Load driver statistics
      const statsResponse = await api.get(`/drivers/${user.id}/statistics`);
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Failed to load driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socketService.connectDriver(user.id);
    
    // Start sending GPS updates if geolocation is available
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          socketService.sendPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/drivers/${user.id}/status`, { status: newStatus });
      setStatus(newStatus);
      socketService.updateStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handlePackageStatusUpdate = async (packageId, newStatus) => {
    try {
      await api.patch(`/packages/${packageId}/status`, { status: newStatus });
      socketService.updatePackageStatus(packageId, newStatus);
      loadDriverData(); // Reload data
    } catch (error) {
      console.error('Failed to update package status:', error);
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="driver-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🛵 BETEX EXPRESS</h1>
          <span className="user-info">Livreur: {user?.firstName || user?.email}</span>
        </div>
        <div className="header-right">
          <div className="status-selector">
            <select 
              value={status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              <option value="offline">Hors ligne</option>
              <option value="online">En ligne</option>
              <option value="in_delivery">En livraison</option>
              <option value="on_break">En pause</option>
            </select>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-label">Livraisons réussies</span>
            <span className="stat-value">{stats?.successfulDeliveries || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total livraisons</span>
            <span className="stat-value">{stats?.totalDeliveries || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Note</span>
            <span className="stat-value">⭐ {stats?.rating || 0}/5</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/driver/history')}
          >
            <span className="action-icon">📋</span>
            <span className="action-text">Historique</span>
          </button>
          <button 
            className="action-btn info"
            onClick={() => navigate('/driver/stats')}
          >
            <span className="action-icon">📊</span>
            <span className="action-text">Statistiques</span>
          </button>
        </div>

        <div className="packages-section">
          <h2>📦 Mes colis ({packages.length})</h2>
          
          {packages.length === 0 ? (
            <div className="empty-state">
              <p>Aucun colis assigné pour le moment</p>
            </div>
          ) : (
            <div className="packages-list">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <div className="package-title">
                      <h3>📦 {pkg.trackingNumber}</h3>
                      <span className="package-priority">
                        {pkg.priority === 'urgent' && '🔥 URGENT'}
                        {pkg.priority === 'high' && '⚡ PRIORITAIRE'}
                      </span>
                    </div>
                    <span className={`status-badge status-${pkg.status}`}>
                      {pkg.status === 'collected' && '📦 À livrer'}
                      {pkg.status === 'in_delivery' && '🚚 En livraison'}
                    </span>
                  </div>
                  
                  {/* Informations de livraison */}
                  <div className="delivery-section">
                    <h4 className="section-title">🎯 LIVRAISON</h4>
                    <div className="package-details">
                      <p><strong>👤 Client:</strong> {pkg.customerName || pkg.receiverName}</p>
                      <p><strong>📞 Téléphone:</strong> {pkg.customerPhone || pkg.receiverPhone}</p>
                      <p><strong>📍 Adresse:</strong> {pkg.address || pkg.receiverAddress}</p>
                      <p><strong>🗺️ Zone:</strong> {pkg.Zone?.name || 'N/A'}</p>
                      {pkg.description && <p><strong>📝 Contenu:</strong> {pkg.description}</p>}
                      {pkg.weight && <p><strong>⚖️ Poids:</strong> {pkg.weight} kg</p>}
                      {pkg.notes && (
                        <div className="package-notes">
                          <p><strong>📋 Notes importantes:</strong></p>
                          <p className="notes-text">{pkg.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tarifs et pricing */}
                  <div className="pricing-section">
                    <h4 className="section-title">💰 TARIFICATION</h4>
                    <div className="pricing-details">
                      {pkg.packagePrice && (
                        <p><strong>📦 Prix du colis:</strong> {parseFloat(pkg.packagePrice).toLocaleString('fr-FR')} FCFA</p>
                      )}
                      {pkg.deliveryPrice && (
                        <p><strong>🚚 Prix de livraison:</strong> {parseFloat(pkg.deliveryPrice).toLocaleString('fr-FR')} FCFA</p>
                      )}
                      {pkg.packagePrice && pkg.deliveryPrice && (
                        <p className="total-price"><strong>💵 Total:</strong> {(parseFloat(pkg.packagePrice) + parseFloat(pkg.deliveryPrice)).toLocaleString('fr-FR')} FCFA</p>
                      )}
                    </div>
                  </div>

                  <div className="package-actions">
                    {pkg.status === 'collected' && (
                      <>
                        <button 
                          className="btn-action btn-secondary"
                          onClick={() => navigate(`/driver/map/${pkg.id}`)}
                        >
                          🗺️ Voir itinéraire
                        </button>
                        <button 
                          className="btn-action btn-primary"
                          onClick={() => handlePackageStatusUpdate(pkg.id, 'in_delivery')}
                        >
                          🚚 Commencer livraison
                        </button>
                      </>
                    )}
                    
                    {pkg.status === 'in_delivery' && (
                      <>
                        <button 
                          className="btn-action btn-secondary"
                          onClick={() => navigate(`/driver/map/${pkg.id}`)}
                        >
                          🗺️ Voir itinéraire
                        </button>
                        <div className="status-actions">
                          <button 
                            className="btn-action btn-success"
                            onClick={() => handlePackageStatusUpdate(pkg.id, 'delivered')}
                          >
                            ✅ Livré avec succès
                          </button>
                          <button 
                            className="btn-action btn-danger"
                            onClick={() => handlePackageStatusUpdate(pkg.id, 'delivery_failed')}
                          >
                            ❌ Échec de livraison
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
