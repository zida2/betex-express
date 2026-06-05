/**
 * Driver History Page
 * Show delivery history for the logged-in driver
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/DriverHistoryPage.css';

const DriverHistoryPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/packages', {
        params: { driverId: user.id }
      });
      
      const allPackages = response.data.data || [];
      
      // Filter only completed deliveries (delivered or failed)
      const completedDeliveries = allPackages.filter(pkg => 
        pkg.status === 'delivered' || pkg.status === 'delivery_failed'
      );
      
      // Sort by date (most recent first)
      completedDeliveries.sort((a, b) => 
        new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt)
      );
      
      setDeliveries(completedDeliveries);
    } catch (error) {
      console.error('Failed to load history:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'delivered') return delivery.status === 'delivered';
    if (filter === 'failed') return delivery.status === 'delivery_failed';
    return true;
  });

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    failed: deliveries.filter(d => d.status === 'delivery_failed').length,
    successRate: deliveries.length > 0 
      ? ((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100).toFixed(1)
      : 0
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="driver-history-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/driver/dashboard')}>
          ← Retour
        </button>
        <h1>📋 Mon Historique</h1>
      </header>

      {/* Statistics Cards */}
      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-label">Livrés</span>
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
            <span className="stat-label">Taux réussite</span>
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
          ✅ Livrés ({stats.delivered})
        </button>
        <button 
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          ❌ Échecs ({stats.failed})
        </button>
      </div>

      {/* Deliveries List */}
      <div className="deliveries-container">
        {filteredDeliveries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucune livraison</h3>
            <p>Votre historique de livraisons apparaîtra ici</p>
          </div>
        ) : (
          <div className="deliveries-list">
            {filteredDeliveries.map(delivery => (
              <div key={delivery.id} className={`delivery-card ${delivery.status}`}>
                <div className="card-header">
                  <div className="tracking-info">
                    <span className="tracking-number">📦 {delivery.trackingNumber}</span>
                    <span className="delivery-date">
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

                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Client</span>
                    <span className="info-value">{delivery.receiverName || delivery.customerName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">📍 Adresse</span>
                    <span className="info-value">{delivery.receiverAddress || delivery.address}</span>
                  </div>
                  {delivery.receiverPhone && (
                    <div className="info-row">
                      <span className="info-label">📞 Téléphone</span>
                      <span className="info-value">{delivery.receiverPhone}</span>
                    </div>
                  )}
                  {delivery.description && (
                    <div className="info-row">
                      <span className="info-label">📝 Description</span>
                      <span className="info-value">{delivery.description}</span>
                    </div>
                  )}
                  {/* Montants et tarifs */}
                  <div className="pricing-section">
                    {delivery.packagePrice && (
                      <div className="info-row price-row">
                        <span className="info-label">📦 Prix du colis</span>
                        <span className="info-value price">
                          {parseFloat(delivery.packagePrice).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                    {delivery.deliveryPrice && (
                      <div className="info-row price-row">
                        <span className="info-label">🚚 Prix de livraison</span>
                        <span className="info-value price">
                          {parseFloat(delivery.deliveryPrice).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    )}
                    {delivery.packagePrice && delivery.deliveryPrice && (
                      <div className="info-row price-row total">
                        <span className="info-label"><strong>Total</strong></span>
                        <span className="info-value price">
                          <strong>{(parseFloat(delivery.packagePrice) + parseFloat(delivery.deliveryPrice)).toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {delivery.isPaid !== undefined && (
                    <div className="info-row payment-status">
                      <span className="info-label">💳 Paiement</span>
                      <span className={`payment-badge ${delivery.isPaid ? 'paid' : 'unpaid'}`}>
                        {delivery.isPaid ? '✓ Payé' : '❌ Non payé'}
                      </span>
                    </div>
                  )}

                  {/* Motif d'échec */}
                  {delivery.status === 'delivery_failed' && (
                    <div className="failure-section">
                      {delivery.failureReason && (
                        <div className="info-row failure-reason">
                          <span className="info-label">⚠️ Motif d'échec</span>
                          <span className="info-value failure-text">{delivery.failureReason}</span>
                        </div>
                      )}
                      {delivery.failureNotes && (
                        <div className="info-row failure-notes">
                          <span className="info-label">📋 Détails supplémentaires</span>
                          <span className="info-value notes-text">{delivery.failureNotes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistoryPage;
