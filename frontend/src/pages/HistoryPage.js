/**
 * History Page
 * View all delivery history with filters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    period: '7days',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    failed: 0,
    successRate: 0
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, packages]);

  const loadHistory = async () => {
    try {
      const response = await api.get('/packages/history');
      const data = response.data.data || response.data || [];
      setPackages(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const delivered = data.filter(p => p.status === 'delivered').length;
    const failed = data.filter(p => p.status === 'delivery_failed').length;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

    setStats({ total, delivered, failed, successRate });
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Filter by period
    const now = Date.now();
    const periods = {
      '7days': 7 * 24 * 60 * 60 * 1000,
      '30days': 30 * 24 * 60 * 60 * 1000,
      '90days': 90 * 24 * 60 * 60 * 1000
    };

    if (filters.period !== 'all' && periods[filters.period]) {
      filtered = filtered.filter(p => {
        const createdAt = new Date(p.createdAt).getTime();
        return (now - createdAt) <= periods[filters.period];
      });
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.trackingNumber?.toLowerCase().includes(search) ||
        p.receiverName?.toLowerCase().includes(search) ||
        p.senderName?.toLowerCase().includes(search)
      );
    }

    setFilteredPackages(filtered);
  };

  const getStatusBadge = (status) => {
    return {
      label: `${getStatusIcon(status)} ${translateStatus(status)}`,
      class: status
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement de l'historique...</div>;
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
            ← Retour
          </button>
          <h1>📊 Historique des Livraisons</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

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
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-label">Taux de réussite</span>
            <span className="stat-value">{stats.successRate}%</span>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label>Statut</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Tous</option>
            <option value="delivered">Livrés</option>
            <option value="delivery_failed">Échecs</option>
            <option value="in_transit">En cours</option>
            <option value="pending">En attente</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Période</label>
          <select 
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
            <option value="all">Tout</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Recherche</label>
          <input
            type="text"
            placeholder="N° suivi, nom..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <div className="history-content">
        {filteredPackages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Aucune livraison trouvée</h3>
            <p>Aucun résultat ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <div className="packages-grid">
            {filteredPackages.map((pkg) => {
              const badge = getStatusBadge(pkg.status);
              return (
                <div key={pkg.id} className="history-card">
                  <div className="card-header">
                    <div className="tracking-info">
                      <span className="tracking-number">#{pkg.trackingNumber}</span>
                      <span className="tracking-date">{formatDate(pkg.createdAt)}</span>
                    </div>
                    <span className={`status-badge badge-${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <div className="info-label">📤 Expéditeur</div>
                      <div className="info-value">{pkg.senderName}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">📥 Destinataire</div>
                      <div className="info-value">{pkg.receiverName}</div>
                    </div>
                    {pkg.assignedDriver && (
                      <div className="info-row">
                        <div className="info-label">🚗 Livreur</div>
                        <div className="info-value">{pkg.assignedDriver.name}</div>
                      </div>
                    )}
                    {/* Montants et tarifs */}
                    <div className="pricing-section">
                      {pkg.packagePrice && (
                        <div className="info-row price-row">
                          <div className="info-label">📦 Prix du colis</div>
                          <div className="info-value price">{parseFloat(pkg.packagePrice).toLocaleString('fr-FR')} FCFA</div>
                        </div>
                      )}
                      {pkg.deliveryPrice && (
                        <div className="info-row price-row">
                          <div className="info-label">🚚 Prix de livraison</div>
                          <div className="info-value price">{parseFloat(pkg.deliveryPrice).toLocaleString('fr-FR')} FCFA</div>
                        </div>
                      )}
                      {pkg.packagePrice && pkg.deliveryPrice && (
                        <div className="info-row price-row total">
                          <div className="info-label"><strong>Total</strong></div>
                          <div className="info-value price"><strong>{(parseFloat(pkg.packagePrice) + parseFloat(pkg.deliveryPrice)).toLocaleString('fr-FR')} FCFA</strong></div>
                        </div>
                      )}
                    </div>

                    {pkg.isPaid !== undefined && (
                      <div className="info-row payment-status">
                        <div className="info-label">💳 Paiement</div>
                        <span className={`payment-badge ${pkg.isPaid ? 'paid' : 'unpaid'}`}>
                          {pkg.isPaid ? '✓ Payé' : '❌ Non payé'}
                        </span>
                      </div>
                    )}

                    {/* Motif d'échec */}
                    {pkg.status === 'delivery_failed' && (
                      <div className="failure-section">
                        {pkg.failureReason && (
                          <div className="info-row failure-reason">
                            <div className="info-label">⚠️ Motif d'échec</div>
                            <div className="info-value failure-text">{pkg.failureReason}</div>
                          </div>
                        )}
                        {pkg.failureNotes && (
                          <div className="info-row failure-notes">
                            <div className="info-label">📋 Détails supplémentaires</div>
                            <div className="info-value notes-text">{pkg.failureNotes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <button className="btn-details">
                      👁️ Voir détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
