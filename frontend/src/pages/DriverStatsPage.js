/**
 * Driver Statistics Page
 * Detailed statistics and performance metrics for the driver
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DriverStatsPage.css';

const DriverStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get(`/drivers/${user.id}/statistics`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="driver-stats-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/driver/dashboard')}>
          ← Retour
        </button>
        <h1>📊 Mes Statistiques</h1>
      </header>

      <div className="stats-container">
        {/* Performance Overview */}
        <div className="stats-section">
          <h2 className="section-title">🎯 Performance Globale</h2>
          
          <div className="stats-grid">
            <div className="stat-big-card primary">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <span className="card-value">{stats?.totalDeliveries || 0}</span>
                <span className="card-label">Total Livraisons</span>
              </div>
            </div>

            <div className="stat-big-card success">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <span className="card-value">{stats?.successfulDeliveries || 0}</span>
                <span className="card-label">Livrées avec Succès</span>
              </div>
            </div>

            <div className="stat-big-card warning">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <span className="card-value">{stats?.onTimeRate || 0}%</span>
                <span className="card-label">Taux Ponctualité</span>
              </div>
            </div>

            <div className="stat-big-card info">
              <div className="card-icon">⭐</div>
              <div className="card-content">
                <span className="card-value">{stats?.rating || 0}/5</span>
                <span className="card-label">Note Moyenne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Performance */}
        <div className="stats-section">
          <h2 className="section-title">📅 Performance Aujourd'hui</h2>
          
          <div className="today-stats">
            <div className="today-stat-item">
              <span className="today-icon">🚚</span>
              <div className="today-info">
                <span className="today-value">{stats?.completedToday || 0}</span>
                <span className="today-label">Livraisons Effectuées</span>
              </div>
            </div>

            <div className="today-stat-item">
              <span className="today-icon">💰</span>
              <div className="today-info">
                <span className="today-value">{((stats?.completedToday || 0) * 1500).toLocaleString()} FCFA</span>
                <span className="today-label">Revenus Estimés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="stats-section">
          <h2 className="section-title">📈 Taux de Réussite</h2>
          
          <div className="success-rate-card">
            <div className="rate-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${((stats?.successfulDeliveries || 0) / (stats?.totalDeliveries || 1)) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#7b2ff7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="rate-text">
                <span className="rate-value">
                  {stats?.totalDeliveries > 0 
                    ? Math.round((stats.successfulDeliveries / stats.totalDeliveries) * 100)
                    : 0}%
                </span>
              </div>
            </div>
            <p className="rate-description">
              {stats?.successfulDeliveries || 0} sur {stats?.totalDeliveries || 0} livraisons réussies
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="stats-section">
          <h2 className="section-title">🏆 Réalisations</h2>
          
          <div className="achievements-grid">
            <div className={`achievement-card ${(stats?.totalDeliveries || 0) >= 50 ? 'unlocked' : ''}`}>
              <div className="achievement-icon">🌟</div>
              <div className="achievement-info">
                <h3>Nouveau Pro</h3>
                <p>50 livraisons</p>
              </div>
            </div>

            <div className={`achievement-card ${(stats?.rating || 0) >= 4.5 ? 'unlocked' : ''}`}>
              <div className="achievement-icon">⭐</div>
              <div className="achievement-info">
                <h3>5 Étoiles</h3>
                <p>Note ≥ 4.5</p>
              </div>
            </div>

            <div className={`achievement-card ${(stats?.onTimeRate || 0) >= 90 ? 'unlocked' : ''}`}>
              <div className="achievement-icon">⚡</div>
              <div className="achievement-info">
                <h3>Rapide</h3>
                <p>90% ponctuel</p>
              </div>
            </div>

            <div className={`achievement-card ${(stats?.totalDeliveries || 0) >= 100 ? 'unlocked' : ''}`}>
              <div className="achievement-icon">👑</div>
              <div className="achievement-info">
                <h3>Champion</h3>
                <p>100 livraisons</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverStatsPage;
