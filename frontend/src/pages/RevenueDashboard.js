/**
 * Revenue Dashboard Page
 * Admin can view daily revenue, driver expenses, and profit calculations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PageLayout.css';
import '../styles/RevenueDashboard.css';

const RevenueDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // 'day', 'week', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [fuelExpenses, setFuelExpenses] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [fuelInputValue, setFuelInputValue] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const DAILY_FUEL_PER_DRIVER = 2000; // Essence quotidienne par défaut
  const MONTHLY_SALARY_PER_DRIVER = 60000; // Payé à la fin du mois

  // Safe number formatter
  const formatNumber = (num) => {
    const safeNum = Number(num) || 0;
    return safeNum.toLocaleString('fr-FR');
  };

  // Get date range based on selected period
  const getDateRange = () => {
    const date = new Date(selectedDate);
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(date.setHours(0, 0, 0, 0));
        endDate = new Date(date.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        startDate = new Date(date.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(date.getFullYear(), 0, 1);
        endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(date.setHours(0, 0, 0, 0));
        endDate = new Date(date.setHours(23, 59, 59, 999));
    }

    return { startDate, endDate };
  };

  // Format period display text
  const getPeriodDisplayText = () => {
    const { startDate, endDate } = getDateRange();
    const date = new Date(selectedDate);

    switch (selectedPeriod) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'week':
        return `Semaine du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
      case 'month':
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'year':
        return `Année ${date.getFullYear()}`;
      default:
        return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // Calculate period multiplier for expenses
  const getPeriodMultiplier = () => {
    switch (selectedPeriod) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 1;
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load drivers
      const driversResponse = await api.get('/drivers');
      console.log('driversResponse:', driversResponse);
      let driversData = driversResponse.data.data;
      console.log('driversData before check:', driversData);
      if (!Array.isArray(driversData)) {
        if (driversData && driversData.drivers) {
          driversData = driversData.drivers;
        } else {
          driversData = [];
        }
      }
      console.log('Final driversData:', driversData);
      setDrivers(driversData);

      // Load deliveries for the selected date (mock for now)
      const deliveriesResponse = await api.get('/delivery-requests', {
        params: { date: selectedDate }
      });
      let deliveriesData = deliveriesResponse.data.data;
      if (!Array.isArray(deliveriesData)) {
        if (deliveriesData && deliveriesData.deliveryRequests) {
          deliveriesData = deliveriesData.deliveryRequests;
        } else {
          deliveriesData = [];
        }
      }
      setDeliveries(deliveriesData);

      // Load fuel expenses for this date (with separate try/catch)
      try {
        const fuelExpensesResponse = await api.get('/expenses/drivers/fuel', {
          params: { date: selectedDate }
        });
        const fuelExpensesData = fuelExpensesResponse.data.data || [];
        const fuelExpensesMap = {};
        fuelExpensesData.forEach(fe => {
          if (fe.driverId) {
            if (!fuelExpensesMap[fe.driverId]) {
              fuelExpensesMap[fe.driverId] = 0;
            }
            fuelExpensesMap[fe.driverId] += fe.amount;
          }
        });
        setFuelExpenses(fuelExpensesMap);
      } catch (fuelError) {
        console.warn('Failed to load fuel expenses:', fuelError);
        setFuelExpenses({});
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setDrivers([]);
      setDeliveries([]);
      setFuelExpenses({});
    } finally {
      setLoading(false);
    }
  };

  const handleEditFuel = (driverId, currentAmount) => {
    setEditingFuel(driverId);
    setFuelInputValue(currentAmount ? currentAmount.toString() : DAILY_FUEL_PER_DRIVER.toString());
  };

  const handleSaveFuel = async (driverId) => {
    try {
      await api.post('/expenses/drivers/fuel', {
        driverId,
        amount: parseFloat(fuelInputValue),
        date: selectedDate
      });
      setFuelExpenses(prev => ({
        ...prev,
        [driverId]: parseFloat(fuelInputValue)
      }));
      setEditingFuel(null);
    } catch (error) {
      console.error('Failed to save fuel expense:', error);
    }
  };

  // Filter deliveries by selected period
  const getFilteredDeliveries = () => {
    const { startDate, endDate } = getDateRange();
    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.createdAt || delivery.date);
      return deliveryDate >= startDate && deliveryDate <= endDate;
    });
  };

  // Get filtered deliveries
  const filteredDeliveries = getFilteredDeliveries();

  // Get deliveries for a specific driver (filtered by period)
  const getDriverDeliveries = (driverId) => {
    return filteredDeliveries.filter(d => d.driverId === driverId);
  };

  // Calculate revenue for a driver
  const calculateDriverRevenue = (driverId) => {
    const driverDeliveries = getDriverDeliveries(driverId);
    return driverDeliveries.reduce((total, delivery) => {
      const price = Number(delivery.deliveryPrice) || Number(delivery.estimatedDeliveryPrice) || 0;
      return total + price;
    }, 0);
  };

  // Get fuel expense for a driver (based on period)
  const getDriverFuelExpense = (driverId) => {
    const baseExpense = Number(fuelExpenses[driverId]) || Number(DAILY_FUEL_PER_DRIVER);
    return baseExpense * getPeriodMultiplier();
  };

  // Calculate profit for a driver
  const calculateDriverProfit = (driverId) => {
    const revenue = calculateDriverRevenue(driverId);
    const fuelExpense = getDriverFuelExpense(driverId);
    return Math.round(revenue - fuelExpense);
  };
  
  const totalRevenue = Math.round(filteredDeliveries.reduce((total, delivery) => {
    const price = Number(delivery.deliveryPrice) || Number(delivery.estimatedDeliveryPrice) || 0;
    return total + price;
  }, 0));

  // Calculate total expenses based on period
  const totalExpenses = Math.round(drivers.reduce((total, driver) => {
    const expense = Number(getDriverFuelExpense(driver.id)) || 0;
    return total + expense;
  }, 0));
  
  const totalProfit = Math.round((totalRevenue || 0) - (totalExpenses || 0));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-layout revenue-dashboard">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <h1>💰 Dashboard Chiffre d'Affaires</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>
      <main className="page-content">

      {/* Date Selector */}
      <div className="date-selector">
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('day')}
          >
            Jour
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Semaine
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Mois
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            Année
          </button>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <p className="date-display">{getPeriodDisplayText()}</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <h3>Encaissement</h3>
            <p className="card-value">{formatNumber(totalRevenue)} FCFA</p>
            <span className="card-label">{filteredDeliveries.length} livraison(s)</span>
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="card-icon">⛽</div>
          <div className="card-content">
            <h3>Dépenses (Essence)</h3>
            <p className="card-value">{formatNumber(totalExpenses)} FCFA</p>
            <span className="card-label">{drivers.length} livreur(s)</span>
          </div>
        </div>

        <div className={`summary-card profit ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{totalProfit >= 0 ? '✅' : '❌'}</div>
          <div className="card-content">
            <h3>Bénéfice Net</h3>
            <p className="card-value">{formatNumber(totalProfit)} FCFA</p>
            <span className="card-label">Encaissement - Dépenses</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="expense-breakdown">
        <h2>📊 Détail des Dépenses & Salaires</h2>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="label">⛽ Essence par livreur/{selectedPeriod === 'day' ? 'jour' : selectedPeriod === 'week' ? 'semaine' : selectedPeriod === 'month' ? 'mois' : 'année'}:</span>
            <span className="value">{formatNumber(DAILY_FUEL_PER_DRIVER * getPeriodMultiplier())} FCFA</span>
            <span className="note">Dépense pour la période</span>
          </div>
          <div className="breakdown-item highlight">
            <span className="label">⛽ Dépense essence totale/{selectedPeriod === 'day' ? 'jour' : selectedPeriod === 'week' ? 'semaine' : selectedPeriod === 'month' ? 'mois' : 'année'} ({drivers.length} livreurs):</span>
            <span className="value">{formatNumber(totalExpenses)} FCFA</span>
          </div>
          <div className="breakdown-item info">
            <span className="label">💰 Salaire par livreur/mois:</span>
            <span className="value">{formatNumber(MONTHLY_SALARY_PER_DRIVER)} FCFA</span>
            <span className="note">Payé en fin de mois</span>
          </div>
          <div className="breakdown-item info">
            <span className="label">💰 Salaires totaux/mois ({drivers.length} livreurs):</span>
            <span className="value">{formatNumber(drivers.length * MONTHLY_SALARY_PER_DRIVER)} FCFA</span>
          </div>
        </div>
      </div>

      {/* Drivers Performance */}
      <div className="drivers-performance">
        <div className="drivers-header">
          <h2>👨‍🚚 Performance des Livreurs</h2>
          <div className="driver-filter">
            <label htmlFor="driver-filter">Filtrer par livreur:</label>
            <select
              id="driver-filter"
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="driver-select"
            >
              <option value="all">Tous les livreurs</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : drivers.length === 0 ? (
          <div className="no-data">Aucun livreur trouvé</div>
        ) : (
          <div className="drivers-grid">
            {drivers
              .filter(driver => selectedDriverFilter === 'all' || driver.id === selectedDriverFilter)
              .map(driver => {
              const driverDeliveries = getDriverDeliveries(driver.id);
              const revenue = Math.round(Number(calculateDriverRevenue(driver.id)) || 0);
              const fuelExpense = Math.round(Number(getDriverFuelExpense(driver.id)) || 0);
              const profit = Math.round(Number(calculateDriverProfit(driver.id)) || 0);

              return (
                <div key={driver.id} className={`driver-card ${profit < 0 ? 'negative-profit' : ''}`}>
                  <div className="driver-header">
                    <div className="driver-avatar">👨‍🚚</div>
                    <div className="driver-name-card">
                      <h4>{driver.name}</h4>
                      <span className={`status-badge ${profit >= 0 ? 'profitable' : 'loss'}`}>
                        {profit >= 0 ? '✅ Rentable' : '⚠️ Perte'}
                      </span>
                    </div>
                  </div>
                  <div className="driver-stats">
                    <div className="stat-item">
                      <span className="stat-label">Livraisons</span>
                      <span className="stat-value">{driverDeliveries.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Encaissement</span>
                      <span className="stat-value revenue">{formatNumber(revenue)} FCFA</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Carburant</span>
                      <div className="stat-value expense">
                        {editingFuel === driver.id ? (
                          <div className="fuel-edit-card">
                            <input
                              type="number"
                              value={fuelInputValue}
                              onChange={(e) => setFuelInputValue(e.target.value)}
                              className="fuel-input-card"
                              min="0"
                            />
                            <div className="fuel-buttons">
                              <button
                                className="save-fuel-btn-card"
                                onClick={() => handleSaveFuel(driver.id)}
                              >
                                ✓
                              </button>
                              <button
                                className="cancel-fuel-btn-card"
                                onClick={() => setEditingFuel(null)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="fuel-display-card">
                            <span>{formatNumber(fuelExpense)} FCFA</span>
                            <button
                              className="edit-fuel-btn-card"
                              onClick={() => handleEditFuel(driver.id, fuelExpense)}
                              title="Modifier le carburant"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Bénéfice</span>
                      <span className={`stat-value profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatNumber(profit)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
      </main>
    </div>
  );
};

export default RevenueDashboard;
