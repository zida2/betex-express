/**
 * Drivers Management Page
 * Manage all drivers
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDrivers, updateDriver, deleteDriver, createDriverWithAuth } from '../services/firebaseService';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/DriversPage.css';
import '../styles/PageLayout.css';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnib: '',
    vehicleType: 'Moto',
    vehiclePlate: ''
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const driversList = await getDrivers();
      console.log('Loaded drivers:', driversList);
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
    setError('');
    
    try {
      if (editingDriver) {
        // Update existing driver
        await updateDriver(editingDriver.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          cnib: formData.cnib,
          vehicleType: formData.vehicleType,
          vehiclePlate: formData.vehiclePlate
        });

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cnib: '',
          vehicleType: 'Moto',
          vehiclePlate: ''
        });

        setEditingDriver(null);
        setShowForm(false);
        loadDrivers();
      } else {
        // Create new driver using separate Firebase app instance
        const result = await createDriverWithAuth(formData);
        
        // Store generated credentials
        setGeneratedCredentials({
          driverName: `${formData.firstName} ${formData.lastName}`,
          email: result.credentials.email,
          password: result.credentials.password
        });

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cnib: '',
          vehicleType: 'Moto',
          vehiclePlate: ''
        });

        // Reload drivers list
        loadDrivers();
      }
    } catch (error) {
      const errorMessage = error.message || 'Erreur lors de la création du livreur';
      setError(errorMessage);
      console.error('Failed to create/update driver:', error);
    }
  };

  const handleEdit = (driver) => {
    // Extract firstName and lastName from name
    const firstName = driver.firstName || '';
    const lastName = driver.lastName || '';
    
    setEditingDriver(driver);
    setFormData({
      firstName: firstName,
      lastName: lastName,
      email: driver.email || '',
      phone: driver.phone || '',
      cnib: driver.cnib || '',
      vehicleType: driver.vehicleType || 'Moto',
      vehiclePlate: driver.vehiclePlate || ''
    });
    setShowForm(true);
    setSelectedDriver(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livreur?')) {
      try {
        await deleteDriver(id);
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
    <div className="page-layout drivers-page">
      <header className="page-header">
        <h1>👨‍🚚 Gestion des Livreurs</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingDriver(null);
            setGeneratedCredentials(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              cnib: '',
              vehicleType: 'Moto',
              vehiclePlate: ''
            });
          }}
        >
          {showForm ? '✕ Annuler' : '➕ Nouveau livreur'}
        </button>
      </header>

      <div className="page-content">
      {showForm && (
        <div className="form-container">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {generatedCredentials && (
            <div className="credentials-display">
              <div className="credentials-header">✅ Livreur créé avec succès</div>
              <div className="credentials-content">
                <div className="driver-info">
                  <h4>{generatedCredentials.driverName}</h4>
                  <p className="credentials-note">⚠️ IMPORTANT: Notez ces identifiants maintenant, ils ne seront plus affichés!</p>
                </div>
                
                <div className="credentials-box">
                  <div className="credential-item">
                    <span className="credential-label">Email (Identifiant):</span>
                    <code className="credential-value">{generatedCredentials.email}</code>
                  </div>
                  <div className="credential-item">
                    <span className="credential-label">Mot de passe temporaire:</span>
                    <code className="credential-value">{generatedCredentials.password}</code>
                  </div>
                </div>

                <div className="credentials-actions">
                  <div className="credentials-actions-row">
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        const text = `Email: ${generatedCredentials.email}\nMot de passe: ${generatedCredentials.password}`;
                        navigator.clipboard.writeText(text);
                        alert('Identifiants copiés !');
                      }}
                    >
                      📋 Copier
                    </button>
                    <button 
                      className="btn-print"
                      onClick={() => window.print()}
                    >
                      🖨️ Imprimer
                    </button>
                  </div>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setGeneratedCredentials(null);
                      setShowForm(false);
                    }}
                  >
                    ✓ J'ai noté les identifiants
                  </button>
                </div>
              </div>
            </div>
          )}

          {!generatedCredentials && (
            <form onSubmit={handleSubmit} className="driver-form">
              <h3>{editingDriver ? '✏️ MODIFIER LE LIVREUR' : 'INFORMATIONS PERSONNELLES'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Desiré"
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
                    placeholder="Zida"
                  />
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="desire@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>CNIB (Numéro d'identification)</label>
                <input
                  type="text"
                  name="cnib"
                  value={formData.cnib}
                  onChange={handleInputChange}
                  placeholder="B1234567890"
                />
              </div>

              <h3>INFORMATIONS VÉHICULE</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Type de véhicule</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                  >
                    <option value="Moto">Moto</option>
                    <option value="Voiture">Voiture</option>
                    <option value="Vélo">Vélo</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Camion">Camion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Plaque d'immatriculation</label>
                  <input
                    type="text"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleInputChange}
                    placeholder="BF-1234-AB"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingDriver ? '✅ Mettre à jour' : '✅ Créer le livreur'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDriver(null);
                    setError('');
                  }}
                >
                  ✕ Annuler
                </button>
              </div>
            </form>
          )}
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
          drivers.map(driver => {
            const isExpanded = selectedDriver?.id === driver.id;
            return (
            <div 
              key={driver.id} 
              className={`driver-card-compact ${isExpanded ? 'expanded' : ''}`}
            >
              <div className="driver-compact-header">
                <div className="driver-avatar-small">
                  👤
                </div>
                <div className="driver-compact-info">
                  <h3>{driver.name}</h3>
                  <span className={`status-badge badge-${driver.status}`}>
                    {getStatusIcon(driver.status)} {translateStatus(driver.status)}
                  </span>
                </div>
              </div>

              <div className="driver-footer">
                <button 
                  className="btn-edit"
                  onClick={(e) => {
                    handleEdit(driver);
                  }}
                  title="Modifier"
                >
                  ✏️ Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={(e) => {
                    handleDelete(driver.id);
                  }}
                  title="Supprimer"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          )})
        )}
      </div>
      </div>
    </div>
  );
};

export default DriversPage;
