/**
 * Routes Management Page
 * Manage delivery routes and assignments
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/RoutesPage.css';
import '../styles/RoutesPage.css';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    phase: 'morning_collection',
    packageIds: []
  });
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routesRes, driversRes, packagesRes] = await Promise.all([
        api.get('/routes'),
        api.get('/drivers'),
        api.get('/packages')
      ]);
      
      // Handle both array and object responses
      const routesList = Array.isArray(routesRes.data.data) ? routesRes.data.data : (routesRes.data.data?.routes || []);
      const driversList = Array.isArray(driversRes.data.data) ? driversRes.data.data : (driversRes.data.data?.drivers || []);
      const packagesList = Array.isArray(packagesRes.data.data) ? packagesRes.data.data : (packagesRes.data.data?.packages || []);
      
      setRoutes(routesList);
      setDrivers(driversList);
      setPackages(packagesList);
    } catch (error) {
      console.error('Failed to load data:', error);
      setRoutes([]);
      setDrivers([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePackageSelect = (packageId) => {
    setFormData(prev => ({
      ...prev,
      packageIds: prev.packageIds.includes(packageId)
        ? prev.packageIds.filter(id => id !== packageId)
        : [...prev.packageIds, packageId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/routes', formData);
      setFormData({
        driverId: '',
        phase: 'morning_collection',
        packageIds: []
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create route:', error);
      alert('Erreur lors de la création de la tournée');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="routes-page">
      <header className="page-header">
        <h1>🗺️ Gestion des Tournées</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '➕ Nouvelle tournée'}
        </button>
      </header>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="route-form">
            <div className="form-row">
              <div className="form-group">
                <label>Livreur</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner un livreur</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Phase</label>
                <select
                  name="phase"
                  value={formData.phase}
                  onChange={handleInputChange}
                >
                  <option value="morning_collection">Collecte matin</option>
                  <option value="evening_delivery">Livraison soir</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Colis à assigner</label>
              <div className="packages-checkbox-list">
                {packages.filter(pkg => pkg.status === 'pending' || pkg.status === 'in_transit').length === 0 ? (
                  <div className="empty-packages-list">
                    <p>📦 Aucun colis disponible pour l'assignation</p>
                  </div>
                ) : (
                  packages.filter(pkg => pkg.status === 'pending' || pkg.status === 'in_transit').map(pkg => (
                    <label key={pkg.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.packageIds.includes(pkg.id)}
                        onChange={() => handlePackageSelect(pkg.id)}
                      />
                      <span>
                        📦 #{pkg.trackingNumber || pkg.id} - {pkg.receiverName || pkg.customerName || 'Non spécifié'} - 📍 {pkg.receiverAddress || pkg.address || 'Non spécifiée'}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Créer la tournée
            </button>
          </form>
        </div>
      )}

      <div className="routes-list">
        {routes.length === 0 ? (
          <div className="empty-state">
            <p>Aucune tournée pour le moment</p>
          </div>
        ) : (
          <table className="routes-table">
            <thead>
              <tr>
                <th>Livreur</th>
                <th>Phase</th>
                <th>Colis</th>
                <th>Statut</th>
                <th>Progression</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(route => (
                <tr key={route.id}>
                  <td>{route.Driver?.name || 'N/A'}</td>
                  <td>{route.phase}</td>
                  <td>{route.totalPackages}</td>
                  <td>
                    <span className={`status-badge status-${route.status}`}>
                      {route.status}
                    </span>
                  </td>
                  <td>
                    {route.completedPackages}/{route.totalPackages}
                  </td>
                  <td>{route.estimatedDuration || '-'} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;
