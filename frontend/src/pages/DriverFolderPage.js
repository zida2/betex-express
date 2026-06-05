/**
 * Driver Folder Page
 * Admin view: See all drivers with their complete history
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/DriverFolderPage.css';

const DriverFolderPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverHistory, setDriverHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const driversData = response.data.data?.drivers || response.data.data || [];
      setDrivers(driversData);
      
      // Select first driver by default
      if (driversData.length > 0) {
        setSelectedDriver(driversData[0]);
        loadDriverHistory(driversData[0].id);
      }
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverHistory = async (driverId) => {
    try {
      setHistoryLoading(true);
      const response = await api.get('/packages/history', {
        params: { driverId }
      });
      
      const history = response.data.data || [];
      // Sort by date (most recent first)
      history.sort((a, b) => 
        new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt)
      );
      
      setDriverHistory(history);
    } catch (error) {
      console.error('Failed to load driver history:', error);
      setDriverHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    loadDriverHistory(driver.id);
  };

  const filteredHistory = driverHistory.filter(delivery => {
    if (filter === 'delivered') return delivery.status === 'delivered';
    if (filter === 'failed') return delivery.status === 'delivery_failed';
    return true;
  });

  const calculateStats = () => {
    if (!selectedDriver || driverHistory.length === 0) {
      return { total: 0, delivered: 0, failed: 0, successRate: 0 };
    }

    const total = driverHistory.length;
    const delivered = driverHistory.filter(d => d.status === 'delivered').length;
    const failed = driverHistory.filter(d => d.status === 'delivery_failed').length;
    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

    return { total, delivered, failed, successRate };
  };

  const stats = calculateStats();

  const getDriverStats = (driver) => {
    const driverDeliveries = driverHistory.filter(d => d.assignedDriver?.id === driver.id);
    const successful = driverDeliveries.filter(d => d.status === 'delivered').length;
    const total = driverDeliveries.length;
    const rate = total > 0 ? ((successful / total) * 100).toFixed(0) : 0;
    
    return { successful, total, rate };
  };

  if (loading) {
    return <div className="loading">Chargement des livreurs...</div>;
  }

  return (
    <div className="driver-folder-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <h1>👥 Dossiers des Livreurs</h1>
      </header>

      <div className="folder-container">
        {/* Drivers List - Left Sidebar */}
        <div className="drivers-sidebar">
          <div className="sidebar-header">
            <h2>Livreurs ({drivers.length})</h2>
          </div>
          
          <div className="drivers-list">
            {drivers.length === 0 ? (
              <div className="empty-drivers">
                <p>Aucun livreur disponible</p>
              </div>
            ) : (
              drivers.map(driver => {
                const dStats = getDriverStats(driver);
                const isSelected = selectedDriver?.id === driver.id;
                
                return (
                  <div
                    key={driver.id}
                    className={`driver-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectDriver(driver)}
                  >
                    <div className="driver-item-header">
                      <div className="driver-avatar">{driver.firstName?.charAt(0) || 'D'}</div>
                      <div className="driver-name-section">
                        <div className="driver-name">
                          {driver.firstName} {driver.lastName}
                        </div>
                        <div className="driver-status">
                          <span className={`status-badge status-${driver.status || 'active'}`}>
                            {driver.status || 'active'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="driver-item-stats">
                      <span className="stat-badge">{dStats.total} livraisons</span>
                      <span className="stat-rate">{dStats.rate}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Driver Details and History - Main Content */}
        <div className="driver-content">
          {selectedDriver ? (
            <>
              {/* Driver Info Card */}
              <div className="driver-info-card">
                <div className="info-header">
                  <div className="info-avatar">{selectedDriver.firstName?.charAt(0) || 'D'}</div>
                  <div className="info-details">
                    <h2>{selectedDriver.firstName} {selectedDriver.lastName}</h2>
                    <p className="info-email">{selectedDriver.email}</p>
                  </div>
                  <div className="info-status">
                    <span className={`status-badge status-${selectedDriver.status || 'active'}`}>
                      {selectedDriver.status || 'active'}
                    </span>
                  </div>
                </div>

                <div className="info-details-grid">
                  <div className="info-item">
                    <span className="info-label">📝 CNIB</span>
                    <span className="info-value">{selectedDriver.cnib || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📞 Téléphone</span>
                    <span className="info-value">{selectedDriver.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🚗 Véhicule</span>
                    <span className="info-value">{selectedDriver.vehicleType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📋 Plaque</span>
                    <span className="info-value">{selectedDriver.vehiclePlate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="history-stats">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <span className="stat-label">Total livraisons</span>
                    <span className="stat-value">{stats.total}</span>
                  </div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-label">Réussies</span>
                    <span className="stat-value">{stats.delivered}</span>
                  </div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-icon">❌</div>
                  <div className="stat-info">
                    <span className="stat-label">Échecs</span>
                    <span className="stat-value">{stats.failed}</span>
                  </div>
                </div>
                <div className="stat-card info">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <span className="stat-label">Taux de réussite</span>
                    <span className="stat-value">{stats.successRate}%</span>
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tout ({stats.total})
                </button>
                <button 
                  className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                  onClick={() => setFilter('delivered')}
                >
                  ✅ Réussies ({stats.delivered})
                </button>
                <button 
                  className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                  onClick={() => setFilter('failed')}
                >
                  ❌ Échecs ({stats.failed})
                </button>
              </div>

              {/* History List */}
              <div className="history-container">
                {historyLoading ? (
                  <div className="loading-mini">Chargement de l'historique...</div>
                ) : filteredHistory.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>Aucune livraison</h3>
                    <p>Cet livreur n'a pas de livraison avec ce filtre</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {filteredHistory.map(delivery => (
                      <div key={delivery.id} className={`history-item ${delivery.status}`}>
                        <div className="item-header">
                          <div className="tracking-info">
                            <span className="tracking-number">#{delivery.trackingNumber}</span>
                            <span className="tracking-date">
                              {new Date(delivery.deliveredAt || delivery.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className={`status-badge badge-${delivery.status}`}>
                            {getStatusIcon(delivery.status)} {translateStatus(delivery.status)}
                          </span>
                        </div>

                        <div className="item-body">
                          <div className="info-row">
                            <span className="label">Client</span>
                            <span className="value">{delivery.receiverName || delivery.customerName}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">📍 Adresse</span>
                            <span className="value">{delivery.receiverAddress || delivery.address}</span>
                          </div>
                          {delivery.receiverPhone && (
                            <div className="info-row">
                              <span className="label">📞 Tél</span>
                              <span className="value">{delivery.receiverPhone}</span>
                            </div>
                          )}
                          {delivery.description && (
                            <div className="info-row">
                              <span className="label">📝 Description</span>
                              <span className="value">{delivery.description}</span>
                            </div>
                          )}
                          
                          {/* Failure Reason */}
                          {delivery.status === 'delivery_failed' && delivery.failureReason && (
                            <div className="info-row failure-reason">
                              <span className="label">⚠️ Motif d'échec</span>
                              <span className="value failure-text">{delivery.failureReason}</span>
                            </div>
                          )}
                          {delivery.status === 'delivery_failed' && delivery.failureNotes && (
                            <div className="info-row failure-notes">
                              <span className="label">📋 Détails</span>
                              <span className="value notes-text">{delivery.failureNotes}</span>
                            </div>
                          )}

                          {/* Price and Payment */}
                          <div className="info-row price-row">
                            <span className="label">💰 Montant</span>
                            <span className="value price">
                              {delivery.packagePrice?.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                          {delivery.isPaid !== undefined && (
                            <div className="info-row payment-status">
                              <span className="label">💳 Paiement</span>
                              <span className={`payment-badge ${delivery.isPaid ? 'paid' : 'unpaid'}`}>
                                {delivery.isPaid ? '✓ Payé' : '❌ Non payé'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Sélectionnez un livreur</h3>
              <p>Choisissez un livreur dans la liste pour voir son dossier complet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverFolderPage;
