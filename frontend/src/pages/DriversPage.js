/**
 * Drivers Management Page
 * Manage all drivers
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DriversPage.css';
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

      <div className="drivers-list">
        {drivers.length === 0 ? (
          <div className="empty-state">
            <p>Aucun livreur pour le moment</p>
          </div>
        ) : (
          <table className="drivers-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Véhicule</th>
                <th>Statut</th>
                <th>Livraisons</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id}>
                  <td>{driver.name}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.email || '-'}</td>
                  <td>{driver.vehicleType || '-'}</td>
                  <td>
                    <span className={`status-badge status-${driver.status}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td>{driver.totalDeliveries || 0}</td>
                  <td>⭐ {driver.rating || 0}/5</td>
                  <td>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(driver.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DriversPage;
