/**
 * Client Portal Page - WITH EXPRESS & SCHEDULED DELIVERY OPTIONS
 * Customers can choose between express and scheduled delivery
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ClientPortal.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('delivery-type');
  const [deliveryType, setDeliveryType] = useState(null); // 'express' ou 'scheduled'
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
    senderLat: null,
    senderLng: null,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverLat: null,
    receiverLng: null,
    weight: '',
    description: '',
    packagePrice: '',
    deliveryType: 'scheduled', // Par défaut programmée
    scheduledDate: '',
    scheduledTime: '',
    estimatedDeliveryPrice: 0
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      // En mode démo, filtre par le client par défaut "Sophie Yao"
      const response = await api.get('/delivery-requests', { 
        params: {
          receiverName: 'Sophie Yao',
          receiverPhone: '+225 07 88 99 11 22'
        }
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      const driversList = response.data.data || [];
      setDrivers(driversList);
      filterDriversByDistance(userLocation, driversList);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
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

  // Calculate delivery price based on distance
  const calculateDeliveryPrice = (distance) => {
    const basePrice = 1000; // Prix de base
    const pricePerKm = 200;
    return Math.ceil(basePrice + (distance * pricePerKm));
  };

  // Filter drivers by distance
  const filterDriversByDistance = (location, driversList = drivers) => {
    if (location && location.latitude && location.longitude) {
      const nearby = driversList.map(driver => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          driver.currentLat || 12.3714,
          driver.currentLng || -1.5197
        );
        const price = calculateDeliveryPrice(distance);
        return { ...driver, distance, estimatedPrice: price };
      }).filter(driver => driver.distance <= 5) // Seulement livreurs à moins de 5 km
        .sort((a, b) => a.distance - b.distance);
      
      setFilteredDrivers(nearby);
    }
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

  // Get sender location (for express delivery)
  const handleGetExpressLocation = () => {
    requestGeolocation((location) => {
      setUserLocation(location);
      setDeliveryRequest(prev => ({
        ...prev,
        senderLat: location.latitude,
        senderLng: location.longitude,
        senderAddress: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      }));
      // Load nearby drivers
      loadDrivers();
    });
  };

  // Get receiver location
  const handleGetReceiverLocation = () => {
    requestGeolocation((location) => {
      setDeliveryRequest(prev => ({
        ...prev,
        receiverLat: location.latitude,
        receiverLng: location.longitude,
        receiverAddress: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      }));
    });
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setDeliveryRequest(prev => ({
      ...prev,
      estimatedDeliveryPrice: driver.estimatedPrice
    }));
  };

  const handleRequestDelivery = async () => {
    if (!deliveryRequest.senderName || !deliveryRequest.senderPhone) {
      setMessage('❌ Votre nom et téléphone sont obligatoires');
      return;
    }
    if (!deliveryRequest.receiverName || !deliveryRequest.receiverPhone) {
      setMessage('❌ Le nom et le téléphone du destinataire sont obligatoires');
      return;
    }
    if (deliveryType === 'express' && !selectedDriver) {
      setMessage('❌ Veuillez sélectionner un livreur');
      return;
    }

    try {
      setLoading(true);
      const newRequest = {
        ...deliveryRequest,
        deliveryType: deliveryType,
        ...(deliveryType === 'express' && {
          driverId: selectedDriver.id,
          driverName: selectedDriver.name,
          driverPhone: selectedDriver.phone,
          deliveryPrice: selectedDriver.estimatedPrice
        }),
        status: deliveryType === 'express' ? 'approved' : 'pending_approval',
        createdAt: new Date().toISOString()
      };

      const response = await api.post('/delivery-requests', newRequest);
      setRequests([...requests, response.data.data]);
      const messageText = deliveryType === 'express' 
        ? '✅ Demande express créée ! Le livreur est en route'
        : '✅ Demande programmée créée ! Un admin examinera votre demande';
      setMessage(messageText);
      
      // Reset form
      setDeliveryRequest({
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        senderLat: null,
        senderLng: null,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        receiverLat: null,
        receiverLng: null,
        weight: '',
        description: '',
        packagePrice: '',
        deliveryType: 'scheduled',
        scheduledDate: '',
        scheduledTime: '',
        estimatedDeliveryPrice: 0
      });
      setDeliveryType(null);
      setSelectedDriver(null);
      setUserLocation(null);
      setTimeout(() => setMessage(''), 3000);
      setTimeout(() => setActiveTab('my-requests'), 1000);
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
          className={`tab-btn ${activeTab === 'create-request' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-request')}
        >
          📝 Créer une demande
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
        {/* Create Request Tab */}
        {activeTab === 'create-request' && (
          <div className="create-request-section">
            {/* Delivery Type Selection Screen */}
            {!deliveryType && (
              <div className="delivery-type-selection">
                <div className="form-header">
                  <h2>🚚 Choisir le type de livraison</h2>
                  <p>Sélectionnez le type de livraison qui vous convient</p>
                </div>

                <div className="delivery-type-grid">
                  {/* Express Delivery */}
                  <div 
                    className="delivery-type-card express"
                    onClick={() => setDeliveryType('express')}
                  >
                    <div className="type-icon">⚡</div>
                    <h3>Livraison Express</h3>
                    <p className="type-description">Livraison immédiate avec un livreur de votre région</p>
                    <ul className="type-features">
                      <li>✓ Livreur sélectionné immédiatement</li>
                      <li>✓ Distance et prix calculés en temps réel</li>
                      <li>✓ Livraison rapide</li>
                    </ul>
                  </div>

                  {/* Scheduled Delivery */}
                  <div 
                    className="delivery-type-card scheduled"
                    onClick={() => setDeliveryType('scheduled')}
                  >
                    <div className="type-icon">📅</div>
                    <h3>Livraison Programmée</h3>
                    <p className="type-description">Programmez votre livraison pour plus tard</p>
                    <ul className="type-features">
                      <li>✓ Choisir date et heure</li>
                      <li>✓ Admin assigne le livreur</li>
                      <li>✓ Flexible et planifié</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Express Delivery Flow */}
            {deliveryType === 'express' && !selectedDriver && (
              <div className="express-delivery-flow">
                <div className="form-header">
                  <button 
                    type="button"
                    className="btn-back"
                    onClick={() => {
                      setDeliveryType(null);
                      setUserLocation(null);
                      setFilteredDrivers([]);
                    }}
                  >
                    ← Retour
                  </button>
                  <h2>⚡ Livraison Express</h2>
                </div>

                {!userLocation ? (
                  <div className="location-request-section">
                    <div className="location-prompt">
                      <h3>📍 Localisation requise</h3>
                      <p>Pour trouver les livreurs près de vous, nous avons besoin de votre position géographique</p>
                      <button
                        type="button"
                        className="btn-get-location"
                        onClick={handleGetExpressLocation}
                        disabled={geoLoading}
                      >
                        {geoLoading ? '⏳ Localisation en cours...' : '📍 Activer la géolocalisation'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Nearby Drivers List */}
                    {loading ? (
                      <div className="drivers-loading">
                        <p>⏳ Chargement des livreurs à proximité...</p>
                      </div>
                    ) : filteredDrivers.length > 0 ? (
                      <div className="nearby-drivers-section">
                        <h3>👨‍🚚 Livreurs disponibles à proximité</h3>
                        <p className="drivers-count">{filteredDrivers.length} livreur(s) trouvé(s) à moins de 5 km</p>
                        
                        <div className="drivers-grid">
                          {filteredDrivers.map(driver => (
                            <div 
                              key={driver.id} 
                              className="driver-card express-card"
                              onClick={() => handleSelectDriver(driver)}
                            >
                              <div className="driver-header">
                                <h3>👨‍🚚 {driver.name}</h3>
                                <div className="distance-badge">{driver.distance.toFixed(1)} km</div>
                              </div>
                              
                              <div className="driver-info">
                                <p><strong>Téléphone:</strong> {driver.phone}</p>
                                <p><strong>Type:</strong> {driver.vehicleType}</p>
                                <p><strong>Évaluation:</strong> ⭐ {driver.rating || 4.5}</p>
                                <p className="price-info">
                                  <strong>Tarif estimé:</strong> <span className="price">{driver.estimatedPrice} FCFA</span>
                                </p>
                              </div>
                              
                              <button className="btn-select-driver">
                                Sélectionner ce livreur
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="no-drivers">
                        <p>❌ Aucun livreur disponible à proximité</p>
                        <p>Veuillez réessayer ou choisir une livraison programmée</p>
                        <button 
                          type="button"
                          className="btn-back"
                          onClick={() => {
                            setDeliveryType(null);
                            setUserLocation(null);
                            setFilteredDrivers([]);
                          }}
                        >
                          ← Retour au choix de livraison
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Scheduled Delivery Form */}
            {deliveryType === 'scheduled' && (
              <div className="scheduled-delivery-flow">
                <div className="form-header">
                  <button 
                    type="button"
                    className="btn-back"
                    onClick={() => {
                      setDeliveryType(null);
                      setSelectedDriver(null);
                      setUserLocation(null);
                      setFilteredDrivers([]);
                    }}
                  >
                    ← Retour
                  </button>
                  <h2>📅 Livraison Programmée</h2>
                  <p>Programmez votre livraison. Un admin assignera le livreur approprié.</p>
                </div>

                <form className="delivery-form">
                  <fieldset>
                    <legend>⏰ Date et heure de livraison</legend>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date souhaitée <span className="required">*</span></label>
                        <input
                          type="date"
                          name="scheduledDate"
                          value={deliveryRequest.scheduledDate}
                          onChange={handleDeliveryChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Heure souhaitée <span className="required">*</span></label>
                        <input
                          type="time"
                          name="scheduledTime"
                          value={deliveryRequest.scheduledTime}
                          onChange={handleDeliveryChange}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>
                </form>
              </div>
            )}

            {/* Form Section - Show after driver selection (express) or with scheduled setup */}
            {deliveryType && ((deliveryType === 'express' && selectedDriver) || deliveryType === 'scheduled') && (
              <>
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
                    placeholder="+225 70 00 00 00"
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
                    onClick={handleGetReceiverLocation}
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
                    placeholder="+225 70 00 00 00"
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

                  <div className="form-group">
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
                onClick={handleRequestDelivery}
                disabled={loading}
              >
                {loading ? '⏳ Envoi...' : '📤 Envoyer la demande'}
              </button>
                </form>
              </>
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
