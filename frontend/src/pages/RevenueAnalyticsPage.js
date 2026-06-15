/**
 * Revenue Analytics Page
 * Calculate and display revenue, driver costs, and profit margins
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/RevenueAnalyticsPage.css';
import '../styles/PageLayout.css';

const RevenueAnalyticsPage = () => {
  const [period, setPeriod] = useState('current-month'); // 'current-month', 'last-month', 'last-3-months', 'year'
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const DRIVER_MONTHLY_SALARY = 60000; // 60 000 FCFA par mois
  const MORNING_BONUS = 2000; // 2000 FCFA chaque collecte du matin

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger les demandes de livraison
      const deliveriesResponse = await api.get('/delivery-requests');
      setDeliveries(deliveriesResponse.data.data || []);

      // Charger les livreurs
      const driversResponse = await api.get('/drivers');
      setDrivers(driversResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcul du chiffre d'affaires basé sur les livraisons
  const calculateRevenue = () => {
    // Prix des livraisons express: 500 + distance * 250
    // Prix des livraisons programmées: selon la zone (1000-2000)
    
    let expressRevenue = 0;
    let scheduledRevenue = 0;

    deliveries.forEach(delivery => {
      if (delivery.deliveryType === 'express' && delivery.deliveryPrice) {
        expressRevenue += delivery.deliveryPrice;
      } else if (delivery.deliveryType === 'scheduled' && delivery.estimatedDeliveryPrice) {
        scheduledRevenue += delivery.estimatedDeliveryPrice;
      }
    });

    return {
      express: expressRevenue,
      scheduled: scheduledRevenue,
      total: expressRevenue + scheduledRevenue
    };
  };

  // Calcul du coût des salaires et bonus
  const calculateDriverCosts = () => {
    const totalDrivers = drivers.length || 5; // Par défaut 5 livreurs si pas de données
    const monthlySalaries = totalDrivers * DRIVER_MONTHLY_SALARY;

    // Compter les collectes du matin
    const morningCollections = deliveries.filter(d => 
      d.deliveryType === 'scheduled' && 
      d.scheduledTime === '07:00-10:00'
    ).length;

    const morningBonuses = morningCollections * MORNING_BONUS;

    return {
      salaries: monthlySalaries,
      bonuses: morningBonuses,
      total: monthlySalaries + morningBonuses,
      drivers: totalDrivers,
      morningCollections
    };
  };

  // Calcul de la marge bénéficiaire
  const calculateProfitMargin = () => {
    const revenue = calculateRevenue();
    const costs = calculateDriverCosts();
    const profit = revenue.total - costs.total;
    const margin = revenue.total > 0 ? (profit / revenue.total) * 100 : 0;

    return {
      profit,
      margin: margin.toFixed(2),
      revenue: revenue.total,
      costs: costs.total
    };
  };

  const revenue = calculateRevenue();
  const costs = calculateDriverCosts();
  const profitData = calculateProfitMargin();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="page-layout revenue-analytics-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <h1>💰 Analyse du Chiffre d'Affaires</h1>
      </header>

      <div className="page-content analytics-container">
        {/* Period Selector */}
        <div className="period-selector">
          <button
            className={`period-btn ${period === 'current-month' ? 'active' : ''}`}
            onClick={() => setPeriod('current-month')}
          >
            📅 Ce Mois
          </button>
          <button
            className={`period-btn ${period === 'last-month' ? 'active' : ''}`}
            onClick={() => setPeriod('last-month')}
          >
            📅 Mois Dernier
          </button>
          <button
            className={`period-btn ${period === 'last-3-months' ? 'active' : ''}`}
            onClick={() => setPeriod('last-3-months')}
          >
            📅 3 Derniers Mois
          </button>
          <button
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            📅 Cette Année
          </button>
        </div>

        {/* Revenue Overview */}
        <div className="analytics-grid">
          {/* Total Revenue Card */}
          <div className="analytics-card revenue-card">
            <div className="card-icon">📊</div>
            <h3>Chiffre d'Affaires Total</h3>
            <p className="card-value">{revenue.total.toLocaleString('fr-FR')} FCFA</p>
            <div className="card-details">
              <div className="detail-row">
                <span>Express:</span>
                <strong>{revenue.express.toLocaleString('fr-FR')} FCFA</strong>
              </div>
              <div className="detail-row">
                <span>Programmée:</span>
                <strong>{revenue.scheduled.toLocaleString('fr-FR')} FCFA</strong>
              </div>
            </div>
          </div>

          {/* Total Costs Card */}
          <div className="analytics-card costs-card">
            <div className="card-icon">💼</div>
            <h3>Coûts Mensuels</h3>
            <p className="card-value">{costs.total.toLocaleString('fr-FR')} FCFA</p>
            <div className="card-details">
              <div className="detail-row">
                <span>Salaires ({costs.drivers} livreurs):</span>
                <strong>{costs.salaries.toLocaleString('fr-FR')} FCFA</strong>
              </div>
              <div className="detail-row">
                <span>Bonus Matin ({costs.morningCollections}):</span>
                <strong>{costs.bonuses.toLocaleString('fr-FR')} FCFA</strong>
              </div>
            </div>
          </div>

          {/* Profit Card */}
          <div className="analytics-card profit-card">
            <div className="card-icon">📈</div>
            <h3>Bénéfice Net</h3>
            <p className={`card-value ${profitData.profit >= 0 ? 'positive' : 'negative'}`}>
              {profitData.profit.toLocaleString('fr-FR')} FCFA
            </p>
            <div className="card-details">
              <div className="detail-row">
                <span>Marge Bénéficiaire:</span>
                <strong>{profitData.margin}%</strong>
              </div>
              <div className="detail-row">
                <span>ROI:</span>
                <strong>{profitData.margin > 0 ? '✅' : '❌'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="breakdown-section">
          <h2>📊 Détail des Revenus</h2>
          
          <div className="breakdown-grid">
            {/* Revenue Breakdown */}
            <div className="breakdown-card">
              <h3>💵 Revenus par Type</h3>
              <div className="breakdown-item">
                <span>⚡ Livraisons Express</span>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill express"
                    style={{ 
                      width: revenue.total > 0 ? `${(revenue.express / revenue.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">{revenue.express.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="breakdown-item">
                <span>📅 Livraisons Programmées</span>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill scheduled"
                    style={{ 
                      width: revenue.total > 0 ? `${(revenue.scheduled / revenue.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">{revenue.scheduled.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="breakdown-card">
              <h3>💼 Coûts par Catégorie</h3>
              <div className="breakdown-item">
                <span>👨‍🚚 Salaires Livreurs</span>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill salaries"
                    style={{ 
                      width: costs.total > 0 ? `${(costs.salaries / costs.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">{costs.salaries.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="breakdown-item">
                <span>🎁 Bonus Collectes</span>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill bonuses"
                    style={{ 
                      width: costs.total > 0 ? `${(costs.bonuses / costs.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">{costs.bonuses.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-section">
          <h2>📈 Indicateurs Clés</h2>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Nombre de Livraisons</span>
              <span className="metric-value">{deliveries.length}</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Livreurs Actifs</span>
              <span className="metric-value">{costs.drivers}</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Revenu par Livraison</span>
              <span className="metric-value">
                {deliveries.length > 0 
                  ? (revenue.total / deliveries.length).toLocaleString('fr-FR', { maximumFractionDigits: 0 })
                  : 0
                } FCFA
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Coût par Livreur/Mois</span>
              <span className="metric-value">
                {(DRIVER_MONTHLY_SALARY).toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Collectes Matin</span>
              <span className="metric-value">{costs.morningCollections}</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Ratio Coûts/Revenus</span>
              <span className="metric-value">
                {revenue.total > 0 ? ((costs.total / revenue.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;
