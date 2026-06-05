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
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cnib: '',
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
      await api.post('/drivers', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        cnib: formData.cnib,
        vehicleType: formData.vehicleType,
        vehiclePlate: formData.vehiclePlate
      });
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        cnib: '',
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
            <h3>INFORMATIONS PERSONNELLES</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Jean"
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Kouassi"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Numéro CNIB *</label>
                <input
                  type="text"
                  name="cnib"
                  value={formData.cnib}
                  onChange={handleInputChange}
                  required
                  placeholder="BF 12345 67890 12345"
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+226 70 00 00 01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="livreur@betex.com"
                />
              </div>
            </div>

            <h3>INFORMATIONS VÉHICULE</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Type de véhicule *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Moto">Moto</option>
                  <option value="Voiture">Voiture</option>
                  <option value="Vélo">Vélo</option>
                  <option value="Taxi">Taxi</option>
                  <option value="Camion">Camion</option>
                </select>
              </div>
              <div className="form-group">
                <label>Plaque d'immatriculation *</label>
                <input
                  type="text"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleInputChange}
                  required
                  placeholder="BF-1234-AB"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              ✅ Créer le livreur
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
                  <span className="info-icon">👤</span>
                  <span className="info-label">Prénom:</span>
                  <span className="info-value">{driver.firstName}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">👤</span>
                  <span className="info-label">Nom:</span>
                  <span className="info-value">{driver.lastName}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📝</span>
                  <span className="info-label">CNIB:</span>
                  <span className="info-value">{driver.cnib}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span className="info-label">Tél:</span>
                  <span className="info-value">{driver.phone}</span>
                </div>
                {driver.email && (
                  <div className="info-row">
                    <span className="info-icon">📧</span>
                    <span className="info-label">Email:</span>
                    <span className="info-value">{driver.email}</span>
                  </div>
                )}
                {driver.vehicleType && (
                  <div className="info-row">
                    <span className="info-icon">🚗</span>
                    <span className="info-label">Véhicule:</span>
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
