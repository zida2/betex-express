/**
 * Client Portal Page
 * Customers can see available drivers and request delivery
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import '../styles/ClientPortal.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('find-drivers');
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
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
    packagePrice: '',
    deliveryPrice: ''
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
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
  };

  // Filter drivers by distance when user location changes
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

  const handleLocationSelect = (location) => {
    setUserLocation(location);
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiverLocation = (location) => {
    setDeliveryRequest(prev => ({
      ...prev,
      receiverAddress: location.address,
      receiverLat: location.latitude,
      receiverLng: location.longitude
    }));
  };

  const handleRequestDelivery = async (driverId) => {
    if (!deliveryRequest.receiverName || !deliveryRequest.receiverPhone || !deliveryRequest.receiverAddress) {
      setMessage('❌ Veuillez remplir tous les champs de destination');
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
      setMessage('✅ Demande de livraison envoyée à l\'admin pour approbation');
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
        packagePrice: '',
        deliveryPrice: ''
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
        <div className="header-content">
          <h1>🛵 BETEX EXPRESS - Portail Client</h1>
          <p>Trouvez un livreur et demandez une livraison</p>
        </div>
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
        <div className="message-banner">
          {message}
        </div>
      )}

      <main className="client-main">
        {/* Find Drivers Tab */}
        {activeTab === 'find-drivers' && (
          <div className="find-drivers-section">
            <div className="location-section">
              <h2>📍 Votre localisation</h2>
              <LocationPicker
                label="Cliquez pour voir les livreurs près de vous"
                onLocationSelect={handleLocationSelect}
              />
              {userLocation && (
                <div className="location-info">
                  <p>✓ Position: {userLocation.latitude?.toFixed(4)}, {userLocation.longitude?.toFixed(4)}</p>
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
                    <div key={driver.id} className={`driver-card ${selectedDriver?.id === driver.id ? 'selected' : ''}`}>
                      <div className="driver-header">
                        <h3>{driver.name}</h3>
                        {driver.distance && (
                          <span className="distance">📍 {driver.distance} km</span>
                        )}
                      </div>

                      <div className="driver-info">
                        <p><strong>Téléphone:</strong> {driver.phone}</p>
                        <p><strong>Véhicule:</strong> {driver.vehicleType}</p>
                        <p><strong>Immatriculation:</strong> {driver.vehiclePlate}</p>
                        <p><strong>Statut:</strong> 
                          {driver.status === 'available' && ' 🟢 Disponible'}
                          {driver.status === 'active' && ' 🟡 En cours'}
                          {driver.status === 'offline' && ' ⚫ Hors ligne'}
                        </p>
                        <p><strong>Évaluation:</strong> ⭐ {driver.rating || 4.5}/5</p>
                      </div>

                      <button
                        className="btn-select-driver"
                        onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
                      >
                        {selectedDriver?.id === driver.id ? '✓ Sélectionné' : 'Sélectionner'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDriver && (
              <div className="delivery-form-section">
                <h2>📦 Demander une livraison avec {selectedDriver.name}</h2>
                
                <form className="delivery-form">
                  <fieldset>
                    <legend>📍 Informations d'expédition</legend>
                    
                    <div className="form-group">
                      <label>Votre nom</label>
                      <input
                        type="text"
                        name="senderName"
                        value={deliveryRequest.senderName}
                        onChange={handleDeliveryChange}
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div className="form-group">
                      <label>Votre téléphone</label>
                      <input
                        type="tel"
                        name="senderPhone"
                        value={deliveryRequest.senderPhone}
                        onChange={handleDeliveryChange}
                        placeholder="+226 70 00 00 00"
                      />
                    </div>

                    <div className="form-group">
                      <label>Votre adresse</label>
                      <input
                        type="text"
                        name="senderAddress"
                        value={deliveryRequest.senderAddress}
                        onChange={handleDeliveryChange}
                        placeholder="Adresse de l'expéditeur"
                      />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>🎁 Destination</legend>
                    
                    <div className="form-group">
                      <label>Nom du destinataire</label>
                      <input
                        type="text"
                        name="receiverName"
                        value={deliveryRequest.receiverName}
                        onChange={handleDeliveryChange}
                        placeholder="Nom complet du destinataire"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone du destinataire</label>
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
                      <label>Adresse de destination (Localisation GPS)</label>
                      <LocationPicker
                        label="Cliquez pour obtenir la position du destinataire"
                        onLocationSelect={handleReceiverLocation}
                      />
                      <input
                        type="text"
                        name="receiverAddress"
                        value={deliveryRequest.receiverAddress}
                        onChange={handleDeliveryChange}
                        placeholder="Adresse du destinataire"
                        required
                      />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>📋 Détails du colis</legend>
                    
                    <div className="form-group">
                      <label>Description du colis</label>
                      <textarea
                        name="description"
                        value={deliveryRequest.description}
                        onChange={handleDeliveryChange}
                        placeholder="Ex: Vêtements, électronique, nourriture, etc."
                        rows="3"
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
                        <label>Prix du colis (FCFA)</label>
                        <input
                          type="number"
                          name="packagePrice"
                          value={deliveryRequest.packagePrice}
                          onChange={handleDeliveryChange}
                          placeholder="50000"
                        />
                      </div>

                      <div className="form-group">
                        <label>Prix de livraison (FCFA)</label>
                        <input
                          type="number"
                          name="deliveryPrice"
                          value={deliveryRequest.deliveryPrice}
                          onChange={handleDeliveryChange}
                          placeholder="5000"
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
                    <div className="request-header">
                      <h3>Demande #{request.id}</h3>
                      <span className={`status-badge status-${request.status}`}>
                        {getStatusBadge(request.status)}
                      </span>
                    </div>

                    <div className="request-content">
                      <div className="request-row">
                        <div>
                          <strong>📤 Départ:</strong>
                          <p>{request.senderAddress}</p>
                          <p>Tel: {request.senderPhone}</p>
                        </div>
                        <div>
                          <strong>📥 Destination:</strong>
                          <p>{request.receiverAddress}</p>
                          <p>Tel: {request.receiverPhone}</p>
                        </div>
                      </div>

                      <div className="request-row">
                        <div>
                          <strong>👨‍🚚 Livreur:</strong>
                          <p>{request.driverName || 'À assigner'}</p>
                        </div>
                        <div>
                          <strong>📦 Colis:</strong>
                          <p>{request.description}</p>
                          <p>Poids: {request.weight} kg</p>
                        </div>
                        <div>
                          <strong>💰 Tarif:</strong>
                          <p>Colis: {request.packagePrice} FCFA</p>
                          <p>Livraison: {request.deliveryPrice} FCFA</p>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending_approval' && (
                      <div className="request-info">
                        ⏳ Votre demande est en cours d'examen par l'administrateur
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="request-info error">
                        ❌ Votre demande a été rejetée
                        {request.rejectReason && ` : ${request.rejectReason}`}
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <div className="request-info success">
                        ✅ Demande approuvée! Le livreur va vous contacter
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
