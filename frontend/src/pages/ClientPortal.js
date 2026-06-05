/**
 * Client Portal Page - SIMPLIFIED
 * Customers can request delivery (admin assigns driver)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ClientPortal.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('create-request');
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

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryRequest(prev => ({
      ...prev,
      [name]: value
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

    try {
      setLoading(true);
      const newRequest = {
        ...deliveryRequest,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };

      const response = await api.post('/delivery-requests', newRequest);
      setRequests([...requests, response.data.data]);
      setMessage('✅ Demande créée ! Un admin vous contactera pour l\'approbation');
      
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
            <div className="form-header">
              <h2>📝 Créer une demande de livraison</h2>
              <p>Remplissez le formulaire ci-dessous. Un admin examinera votre demande et l'assignera à un livreur.</p>
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
