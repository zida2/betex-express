/**
 * Drivers Management Page
 * Manage all drivers
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/DriversPage.css';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: '',
    vehiclePlate: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const data = response.data.data;
      // Handle both array and object with drivers property
      const driversList = Array.isArray(data) ? data : (data?.drivers || []);
      setDrivers(driversList);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setDrivers([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drivers', formData);
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleType: '',
        vehiclePlate: ''
      });
      setShowForm(false);
      loadDrivers();
    } catch (error) {
      console.error('Failed to create driver:', error);
      alert('Erreur lors de la création du livreur');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livreur?')) {
      try {
        await api.delete(`/drivers/${id}`);
        loadDrivers();
      } catch (error) {
        console.error('Failed to delete driver:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="drivers-page">
      <header className="page-header">
        <h1>👨‍🚚 Gestion des Livreurs</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '➕ Nouveau livreur'}
        </button>
      </header>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="driver-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Type de véhicule</label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  placeholder="Moto, Voiture, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Plaque d'immatriculation</label>
                <input
                  type="text"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Créer le livreur
            </button>
          </form>
        </div>
      )}

      <div className="drivers-grid">
        {drivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🚚</div>
            <h3>Aucun livreur</h3>
            <p>Ajoutez votre premier livreur pour commencer</p>
          </div>
        ) : (
          drivers.map(driver => (
            <div key={driver.id} className="driver-card">
              <div className="driver-header">
                <div className="driver-avatar">
                  👤
                </div>
                <div className="driver-main-info">
                  <h3>{driver.name}</h3>
                  <span className={`status-badge badge-${driver.status}`}>
                    {getStatusIcon(driver.status)} {translateStatus(driver.status)}
                  </span>
                </div>
              </div>

              <div className="driver-body">
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span className="info-value">{driver.phone}</span>
                </div>
                {driver.email && (
                  <div className="info-row">
                    <span className="info-icon">📧</span>
                    <span className="info-value">{driver.email}</span>
                  </div>
                )}
                {driver.vehicleType && (
                  <div className="info-row">
                    <span className="info-icon">🚗</span>
                    <span className="info-value">{driver.vehicleType} {driver.vehiclePlate && `(${driver.vehiclePlate})`}</span>
                  </div>
                )}
              </div>

              <div className="driver-stats">
                <div className="stat-item">
                  <span className="stat-value">{driver.assignedPackages || 0}</span>
                  <span className="stat-label">En cours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{driver.completedToday || driver.totalDeliveries || 0}</span>
                  <span className="stat-label">Livrés</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">⭐ {driver.rating || 0}/5</span>
                  <span className="stat-label">Note</span>
                </div>
              </div>

              <div className="driver-footer">
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(driver.id)}
                  title="Supprimer"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriversPage;
