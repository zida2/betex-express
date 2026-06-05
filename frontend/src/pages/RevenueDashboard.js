/**
 * Revenue Dashboard Page
 * Admin can view daily revenue, driver expenses, and profit calculations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/RevenueDashboard.css';

const RevenueDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const DAILY_FUEL_PER_DRIVER = 2000; // Essence quotidienne par livreur
  const MONTHLY_SALARY_PER_DRIVER = 60000; // Payé à la fin du mois

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load drivers
      const driversResponse = await api.get('/drivers');
      setDrivers(driversResponse.data.data || []);

      // Load deliveries for the selected date (mock for now)
      const deliveriesResponse = await api.get('/delivery-requests', {
        params: { date: selectedDate }
      });
      setDeliveries(deliveriesResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get deliveries for a specific driver
  const getDriverDeliveries = (driverId) => {
    return deliveries.filter(d => d.driverId === driverId);
  };

  // Calculate revenue for a driver
  const calculateDriverRevenue = (driverId) => {
    const driverDeliveries = getDriverDeliveries(driverId);
    return driverDeliveries.reduce((total, delivery) => {
      const price = delivery.deliveryPrice || delivery.estimatedDeliveryPrice || 0;
      return total + price;
    }, 0);
  };

  // Calculate profit for a driver
  const calculateDriverProfit = (driverId) => {
    const revenue = calculateDriverRevenue(driverId);
    return revenue - DAILY_FUEL_PER_DRIVER;
  };

  // Calculate total metrics
  const totalRevenue = deliveries.reduce((total, delivery) => {
    const price = delivery.deliveryPrice || delivery.estimatedDeliveryPrice || 0;
    return total + price;
  }, 0);

  const totalExpenses = drivers.length * DAILY_FUEL_PER_DRIVER;
  const totalProfit = totalRevenue - totalExpenses;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="revenue-dashboard">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <h1>💰 Dashboard Chiffre d'Affaires</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      {/* Date Selector */}
      <div className="date-selector">
        <label>📅 Sélectionner la date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <p className="date-display">{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <h3>Encaissement</h3>
            <p className="card-value">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            <span className="card-label">{deliveries.length} livraison(s)</span>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-icon">⛽</div>
          <div className="card-content">
            <h3>Dépenses (Essence)</h3>
            <p className="card-value">{totalExpenses.toLocaleString('fr-FR')} FCFA</p>
            <span className="card-label">{drivers.length} livreur(s) × 2000 FCFA/jour</span>
          </div>
        </div>

        <div className={`summary-card profit ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{totalProfit >= 0 ? '✅' : '❌'}</div>
          <div className="card-content">
            <h3>Bénéfice Net</h3>
            <p className="card-value">{totalProfit.toLocaleString('fr-FR')} FCFA</p>
            <span className="card-label">Encaissement - Dépenses</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="expense-breakdown">
        <h2>📊 Détail des Dépenses & Salaires</h2>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="label">⛽ Essence par livreur/jour:</span>
            <span className="value">{DAILY_FUEL_PER_DRIVER.toLocaleString('fr-FR')} FCFA</span>
            <span className="note">Dépense quotidienne</span>
          </div>
          <div className="breakdown-item highlight">
            <span className="label">⛽ Dépense essence totale/jour ({drivers.length} livreurs):</span>
            <span className="value">{totalExpenses.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="breakdown-item info">
            <span className="label">💰 Salaire par livreur/mois:</span>
            <span className="value">{MONTHLY_SALARY_PER_DRIVER.toLocaleString('fr-FR')} FCFA</span>
            <span className="note">Payé en fin de mois</span>
          </div>
          <div className="breakdown-item info">
            <span className="label">💰 Salaires totaux/mois ({drivers.length} livreurs):</span>
            <span className="value">{(drivers.length * MONTHLY_SALARY_PER_DRIVER).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Drivers Performance */}
      <div className="drivers-performance">
        <h2>👨‍🚚 Performance des Livreurs</h2>
        
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : drivers.length === 0 ? (
          <div className="no-data">Aucun livreur trouvé</div>
        ) : (
          <div className="drivers-table-wrapper">
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>Livreur</th>
                  <th>Livraisons</th>
                  <th>Encaissement</th>
                  <th>Dépenses</th>
                  <th>Bénéfice</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => {
                  const driverDeliveries = getDriverDeliveries(driver.id);
                  const revenue = calculateDriverRevenue(driver.id);
                  const profit = calculateDriverProfit(driver.id);

                  return (
                    <tr key={driver.id} className={profit < 0 ? 'negative-profit' : ''}>
                      <td className="driver-name">
                        <span className="name-icon">👨‍🚚</span>
                        <span>{driver.firstName} {driver.lastName}</span>
                      </td>
                      <td className="center">{driverDeliveries.length}</td>
                      <td className="amount revenue-cell">{revenue.toLocaleString('fr-FR')} FCFA</td>
                      <td className="amount expense-cell">{DAILY_FUEL_PER_DRIVER.toLocaleString('fr-FR')} FCFA</td>
                      <td className={`amount profit-cell ${profit >= 0 ? 'positive' : 'negative'}`}>
                        {profit.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="center">
                        <span className={`status-badge ${profit >= 0 ? 'profitable' : 'loss'}`}>
                          {profit >= 0 ? '✅ Rentable' : '⚠️ Perte'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formula Explanation */}
      <div className="formula-explanation">
        <h3>📐 Formule de Calcul</h3>
        <div className="formula-box">
          <p><strong>Pour chaque livreur par jour:</strong></p>
          <code>
            Bénéfice = Total Livraisons - Essence<br/>
            Bénéfice = Total Livraisons - 2000 FCFA
          </code>
          <p><strong>Total journalier:</strong></p>
          <code>
            Bénéfice Total = Σ(Encaissement) - (Nombre Livreurs × 2000)
          </code>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
