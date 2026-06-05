/**
 * Client Portal Page - IMPROVED
 * Customers can see available drivers and request delivery
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ClientPortal.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('find-drivers');
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [deliveryRequest, setDeliveryRequest] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverLat: null,
    receiverLng: null,
    weight: '',
    description: '',
    packagePrice: ''
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadDrivers();
    loadMyRequests();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      const driversList = response.data.data || [];
      setDrivers(driversList);
      setFilteredDrivers(driversList);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const response = await api.get('/delivery-requests');
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round((R * c) * 10) / 10;
  };

  // Request geolocation from user
  const requestGeolocation = (callback) => {
    if (!navigator.geolocation) {
      setMessage('❌ Géolocalisation non supportée par votre navigateur');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        callback(location);
        setGeoLoading(false);
      },
      (error) => {
        setMessage('❌ Veuillez activer la géolocalisation pour continuer');
        console.error('Geolocation error:', error);
        setGeoLoading(false);
      }
    );
  };

  // Get sender location
  const handleGetSenderLocation = () => {
    requestGeolocation((location) => {
      setUserLocation(location);
      setDeliveryRequest(prev => ({
        ...prev,
        senderAddress: `${location.latitude}, ${location.longitude}`
      }));
    });
  };

  // Get receiver location
  const handleGetReceiverLocation = () => {
    requestGeolocation((location) => {
      setDeliveryRequest(prev => ({
        ...prev,
        receiverAddress: `${location.latitude}, ${location.longitude}`,
        receiverLat: location.latitude,
        receiverLng: location.longitude
      }));
    });
  };

  // Filter drivers by distance
  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const nearby = drivers.map(driver => ({
        ...driver,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          driver.currentLat || 12.3714,
          driver.currentLng || -1.5197
        )
      })).sort((a, b) => a.distance - b.distance);
      
      setFilteredDrivers(nearby);
    }
  }, [userLocation]);

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(selectedDriver?.id === driver.id ? null : driver);
    // Auto-scroll to form if selected
    if (selectedDriver?.id !== driver.id) {
      setTimeout(() => {
        const formSection = document.querySelector('.delivery-form-section');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleRequestDelivery = async (driverId) => {
    if (!deliveryRequest.receiverName || !deliveryRequest.receiverPhone) {
      setMessage('❌ Le nom et le téléphone du destinataire sont obligatoires');
      return;
    }

    try {
      setLoading(true);
      const newRequest = {
        ...deliveryRequest,
        driverId,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };

      const response = await api.post('/delivery-requests', newRequest);
      setRequests([...requests, response.data.data]);
      setMessage('✅ Demande envoyée à l\'admin pour approbation');
      
      // Reset form
      setDeliveryRequest({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        receiverLat: null,
        receiverLng: null,
        weight: '',
        description: '',
        packagePrice: ''
      });
      setSelectedDriver(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de la création de la demande');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval':
        return '⏳ En attente d\'approbation';
      case 'approved':
        return '✅ Approuvée';
      case 'rejected':
        return '❌ Rejetée';
      case 'in_transit':
        return '🚚 En cours';
      case 'completed':
        return '✔️ Complétée';
      default:
        return status;
    }
  };

  return (
    <div className="client-portal">
      <header className="client-header">
        <h1>🛵 BETEX EXPRESS</h1>
        <button className="btn-logout" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }}>
          Déconnexion
        </button>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'find-drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('find-drivers')}
        >
          🔍 Trouver un livreur
        </button>
        <button
          className={`tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          📋 Mes demandes
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <main className="client-main">
        {/* Find Drivers Tab */}
        {activeTab === 'find-drivers' && (
          <div className="find-drivers-section">
            {!selectedDriver ? (
              <>
                {/* Location & Drivers Section */}
                <div className="location-drivers-wrapper">
                  <div className="location-section">
                    <h2>📍 Votre localisation</h2>
                    <button 
                      className="btn-get-location"
                      onClick={handleGetSenderLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? '⏳ Localisation...' : '📍 Activer ma localisation'}
                    </button>
                    {userLocation && (
                      <div className="location-success">
                        ✓ Position activée
                      </div>
                    )}
                  </div>

                  <div className="drivers-list">
                    <h2>👨‍🚚 Livreurs disponibles {userLocation && `(${filteredDrivers.length})`}</h2>
                    
                    {loading ? (
                      <div className="loading">Chargement...</div>
                    ) : filteredDrivers.length === 0 ? (
                      <div className="no-data">Aucun livreur disponible</div>
                    ) : (
                      <div className="drivers-grid">
                        {filteredDrivers.map(driver => (
                          <div key={driver.id} className="driver-card">
                            <div className="driver-header">
                              <h3>👤 {driver.name}</h3>
                              {driver.distance && (
                                <span className="distance-badge">📍 {driver.distance} km</span>
                              )}
                            </div>

                            <div className="driver-info">
                              <p><strong>🚗</strong> {driver.vehicleType}</p>
                              <p><strong>📋</strong> {driver.vehiclePlate}</p>
                              <p><strong>📞</strong> {driver.phone}</p>
                              <p><strong>⭐</strong> {driver.rating || 4.5}/5</p>
                              <p>
                                <strong>Status:</strong> 
                                {driver.status === 'available' && ' 🟢 Disponible'}
                                {driver.status === 'active' && ' 🟡 En cours'}
                                {driver.status === 'offline' && ' ⚫ Hors ligne'}
                              </p>
                            </div>

                            <button
                              className="btn-select-driver"
                              onClick={() => handleSelectDriver(driver)}
                            >
                              ✓ Sélectionner
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Delivery Form - Visible when driver selected */
              <div className="delivery-form-section active">
                <div className="form-header">
                  <button 
                    className="btn-back"
                    onClick={() => handleSelectDriver(selectedDriver)}
                  >
                    ← Retour
                  </button>
                  <h2>📦 Demande de livraison avec {selectedDriver.name}</h2>
                </div>
                
                <form className="delivery-form">
                  <fieldset>
                    <legend>📤 Vos informations</legend>
                    
                    <div className="form-group">
                      <label>Votre nom <span className="required">*</span></label>
                      <input
                        type="text"
                        name="senderName"
                        value={deliveryRequest.senderName}
                        onChange={handleDeliveryChange}
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Votre téléphone <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="senderPhone"
                        value={deliveryRequest.senderPhone}
                        onChange={handleDeliveryChange}
                        placeholder="+226 70 00 00 00"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Votre adresse (optionnel)</label>
                      <input
                        type="text"
                        name="senderAddress"
                        value={deliveryRequest.senderAddress}
                        onChange={handleDeliveryChange}
                        placeholder="Ou cliquez sur le bouton ci-dessous"
                      />
                      <button 
                        type="button"
                        className="btn-get-location-small"
                        onClick={handleGetSenderLocation}
                        disabled={geoLoading}
                      >
                        {geoLoading ? '⏳' : '📍'} Localisation
                      </button>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>📥 Destinataire</legend>
                    
                    <div className="form-group">
                      <label>Nom du destinataire <span className="required">*</span></label>
                      <input
                        type="text"
                        name="receiverName"
                        value={deliveryRequest.receiverName}
                        onChange={handleDeliveryChange}
                        placeholder="Nom complet"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone du destinataire <span className="required">*</span></label>
                      <input
                        type="tel"
                        name="receiverPhone"
                        value={deliveryRequest.receiverPhone}
                        onChange={handleDeliveryChange}
                        placeholder="+226 70 00 00 00"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Adresse de livraison (optionnel)</label>
                      <input
                        type="text"
                        name="receiverAddress"
                        value={deliveryRequest.receiverAddress}
                        onChange={handleDeliveryChange}
                        placeholder="Ou cliquez sur le bouton ci-dessous"
                      />
                      <button 
                        type="button"
                        className="btn-get-location-small"
                        onClick={handleGetReceiverLocation}
                        disabled={geoLoading}
                      >
                        {geoLoading ? '⏳' : '📍'} Localisation
                      </button>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>📦 Colis (optionnel)</legend>
                    
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={deliveryRequest.description}
                        onChange={handleDeliveryChange}
                        placeholder="Ex: Vêtements, électronique, nourriture..."
                        rows="2"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Poids (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={deliveryRequest.weight}
                          onChange={handleDeliveryChange}
                          placeholder="0.5"
                          step="0.1"
                        />
                      </div>

                      <div className="form-group hidden-field">
                        <label>Prix colis (FCFA)</label>
                        <input
                          type="number"
                          name="packagePrice"
                          value={deliveryRequest.packagePrice}
                          onChange={handleDeliveryChange}
                          placeholder="50000"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <button
                    type="button"
                    className="btn-submit-request"
                    onClick={() => handleRequestDelivery(selectedDriver.id)}
                    disabled={loading}
                  >
                    {loading ? '⏳ Envoi...' : '📤 Envoyer la demande'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="requests-section">
            <h2>📋 Mes demandes de livraison</h2>
            
            {requests.length === 0 ? (
              <div className="no-data">
                <p>Aucune demande pour le moment</p>
                <p>Commencez par trouver un livreur et créer une demande</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map(request => (
                  <div key={request.id} className="request-card">
                    {/* Status Badge - Visible at top */}
                    <div className="request-status">
                      <span className={`status-badge status-${request.status}`}>
                        {getStatusBadge(request.status)}
                      </span>
                    </div>

                    {/* Header with ID */}
                    <div className="request-header">
                      <h3>Demande #{request.id}</h3>
                    </div>

                    {/* Main Content - Better organized */}
                    <div className="request-content">
                      {/* Departure & Destination */}
                      <div className="request-section-box">
                        <div className="request-info-pair">
                          <div className="info-column">
                            <strong>📤 Départ:</strong>
                            <p className="address">{request.senderAddress || 'Non spécifié'}</p>
                            <p className="phone">{request.senderPhone}</p>
                          </div>
                          <div className="info-column">
                            <strong>📥 Destination:</strong>
                            <p className="address">{request.receiverAddress || 'Non spécifié'}</p>
                            <p className="phone">{request.receiverPhone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Package & Driver Info */}
                      <div className="request-section-box">
                        <div className="request-info-pair">
                          <div className="info-column">
                            <strong>📦 Colis:</strong>
                            <p>{request.description || 'Non spécifié'}</p>
                            {request.weight && <p className="weight">{request.weight} kg</p>}
                          </div>
                          <div className="info-column">
                            <strong>👨‍🚚 Livreur:</strong>
                            <p>{request.driverName || 'À assigner'}</p>
                            {request.driverPhone && <p className="phone">{request.driverPhone}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Info Messages */}
                    {request.status === 'pending_approval' && (
                      <div className="request-info pending">
                        ⏳ En attente d'approbation...
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="request-info rejected">
                        ❌ Demande rejetée {request.rejectReason && `: ${request.rejectReason}`}
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="request-info approved">
                        ✅ Le livreur va vous contacter!
                      </div>
                    )}

                    {request.status === 'in_transit' && (
                      <div className="request-info in-transit">
                        🚚 Votre colis est en cours de livraison
                      </div>
                    )}

                    {request.status === 'completed' && (
                      <div className="request-info completed">
                        ✔️ Livraison complétée avec succès!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientPortal;
