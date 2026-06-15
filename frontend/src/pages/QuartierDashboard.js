/**
 * Quartier Dashboard Page
 * Vue d'ensemble des demandes de livraison par quartiers de Ouagadougou
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/QuartierDashboard.css';
import '../styles/PageLayout.css';

const QuartierDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedQuartier, setSelectedQuartier] = useState('all');
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('carte'); // 'carte' ou 'liste'
  
  const navigate = useNavigate();

  // Zones de Ouagadougou
  const zones = [
    'Zone Centre',
    'Zone Nord', 
    'Zone Sud',
    'Zone Est',
    'Zone Ouest',
    'Périphérie'
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [requests, selectedZone, selectedQuartier]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-requests');
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let filteredRequests = requests;

    // Filtrer par zone
    if (selectedZone !== 'all') {
      filteredRequests = filteredRequests.filter(req => 
        req.senderZone === selectedZone || req.receiverZone === selectedZone
      );
    }

    // Filtrer par quartier
    if (selectedQuartier !== 'all') {
      filteredRequests = filteredRequests.filter(req => 
        req.senderQuartier === selectedQuartier || req.receiverQuartier === selectedQuartier
      );
    }

    // Grouper par quartier
    const quartierStats = {};
    const zoneStats = {};

    requests.forEach(req => {
      // Stats expéditeurs
      if (req.senderQuartier) {
        if (!quartierStats[req.senderQuartier]) {
          quartierStats[req.senderQuartier] = {
            nom: req.senderQuartier,
            zone: req.senderZone,
            expediteurs: 0,
            destinataires: 0,
            total: 0
          };
        }
        quartierStats[req.senderQuartier].expediteurs++;
        quartierStats[req.senderQuartier].total++;
      }

      // Stats destinataires
      if (req.receiverQuartier) {
        if (!quartierStats[req.receiverQuartier]) {
          quartierStats[req.receiverQuartier] = {
            nom: req.receiverQuartier,
            zone: req.receiverZone,
            expediteurs: 0,
            destinataires: 0,
            total: 0
          };
        }
        quartierStats[req.receiverQuartier].destinataires++;
        quartierStats[req.receiverQuartier].total++;
      }

      // Stats par zone
      if (req.senderZone) {
        zoneStats[req.senderZone] = (zoneStats[req.senderZone] || 0) + 1;
      }
      if (req.receiverZone && req.receiverZone !== req.senderZone) {
        zoneStats[req.receiverZone] = (zoneStats[req.receiverZone] || 0) + 1;
      }
    });

    setStats({
      quartiers: Object.values(quartierStats).sort((a, b) => b.total - a.total),
      zones: zoneStats,
      totalRequests: filteredRequests.length,
      pendingRequests: filteredRequests.filter(r => r.status === 'pending_approval').length,
      approvedRequests: filteredRequests.filter(r => r.status === 'approved').length
    });
  };

  const getQuartiersOfZone = (zone) => {
    return stats.quartiers?.filter(q => q.zone === zone) || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return '#ffc107';
      case 'approved': return '#00ff88';
      case 'in_transit': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'rejected': return '#ff5252';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_approval': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'in_transit': return 'En transit';
      case 'completed': return 'Complétée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  return (
    <div className="page-layout quartier-dashboard">
      <header className="page-header dashboard-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <div className="header-title">
          <h1>🗺️ Tableau de Bord Géographique</h1>
          <p>Vue d'ensemble des livraisons par quartiers de Ouagadougou</p>
        </div>
      </header>
      
      <div className="page-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* Filtres et contrôles */}
            <div className="controls-section">
              <div className="filters">
                <select 
                  value={selectedZone} 
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Toutes les zones</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
                
                {selectedZone !== 'all' && (
                  <select 
                    value={selectedQuartier} 
                    onChange={(e) => setSelectedQuartier(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les quartiers</option>
                    {getQuartiersOfZone(selectedZone).map(q => (
                      <option key={q.nom} value={q.nom}>{q.nom}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="view-toggles">
                <button 
                  className={`toggle-btn ${viewMode === 'carte' ? 'active' : ''}`}
                  onClick={() => setViewMode('carte')}
                >
                  🗺️ Vue Carte
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'liste' ? 'active' : ''}`}
                  onClick={() => setViewMode('liste')}
                >
                  📋 Vue Liste
                </button>
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="global-stats">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalRequests || 0}</span>
                  <span className="stat-label">Total demandes</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.pendingRequests || 0}</span>
                  <span className="stat-label">En attente</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.approvedRequests || 0}</span>
                  <span className="stat-label">Approuvées</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏘️</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.quartiers?.length || 0}</span>
                  <span className="stat-label">Quartiers actifs</span>
                </div>
              </div>
            </div>

            {/* Vue Carte par zones */}
            {viewMode === 'carte' && (
              <div className="zones-grid">
                {zones.map(zone => (
                  <div key={zone} className="zone-card">
                    <div className="zone-header">
                      <h3>{zone}</h3>
                      <span className="zone-total">
                        {stats.zones?.[zone] || 0} demandes
                      </span>
                    </div>
                    <div className="quartiers-in-zone">
                      {getQuartiersOfZone(zone).length > 0 ? (
                        getQuartiersOfZone(zone).map(quartier => (
                          <div key={quartier.nom} className="quartier-mini-card">
                            <div className="quartier-name">{quartier.nom}</div>
                            <div className="quartier-stats">
                              <span className="expediteurs">📤 {quartier.expediteurs}</span>
                              <span className="destinataires">📥 {quartier.destinataires}</span>
                            </div>
                            <div className="quartier-total">{quartier.total} total</div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activity">Aucune activité</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vue Liste des demandes */}
            {viewMode === 'liste' && (
              <div className="requests-section">
                <h3>📋 Demandes de livraison ({requests.length})</h3>
                <div className="requests-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Expéditeur</th>
                        <th>Destinataire</th>
                        <th>Type</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(request => (
                        <tr key={request.id}>
                          <td>
                            <strong>{request.trackingNumber}</strong>
                          </td>
                          <td>
                            <div className="person-info">
                              <strong>{request.senderName}</strong>
                              {request.senderQuartier && (
                                <div className="location-info">
                                  🏘️ {request.senderQuartier}
                                  <span className="zone-badge">{request.senderZone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="person-info">
                              <strong>{request.receiverName}</strong>
                              {request.receiverQuartier && (
                                <div className="location-info">
                                  🏘️ {request.receiverQuartier}
                                  <span className="zone-badge">{request.receiverZone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`type-badge ${request.deliveryType}`}>
                              {request.deliveryType === 'express' ? '⚡ Express' : '📅 Programmée'}
                            </span>
                          </td>
                          <td>
                            <strong>{request.deliveryPrice} FCFA</strong>
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(request.status) }}
                            >
                              {getStatusText(request.status)}
                            </span>
                          </td>
                          <td>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top quartiers */}
            <div className="top-quartiers">
              <h3>🏆 Top Quartiers Actifs</h3>
              <div className="quartiers-ranking">
                {stats.quartiers?.slice(0, 10).map((quartier, index) => (
                  <div key={quartier.nom} className="ranking-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="quartier-details">
                      <strong>{quartier.nom}</strong>
                      <span className="zone">{quartier.zone}</span>
                    </div>
                    <div className="activity-bars">
                      <div className="bar expediteurs" style={{width: `${(quartier.expediteurs / quartier.total) * 100}%`}}>
                        📤 {quartier.expediteurs}
                      </div>
                      <div className="bar destinataires" style={{width: `${(quartier.destinataires / quartier.total) * 100}%`}}>
                        📥 {quartier.destinataires}  
                      </div>
                    </div>
                    <div className="total-score">{quartier.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuartierDashboard;