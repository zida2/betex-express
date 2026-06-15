/**
 * Client Portal Page - WITH EXPRESS & SCHEDULED DELIVERY OPTIONS
 * Customers can choose between express and scheduled delivery
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnnouncements, getDrivers, getDeliveryRequests, createDeliveryRequest, createPackage } from '../services/firebaseService';
import '../styles/ClientPortal.css';
import '../styles/PageLayout.css';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('create-request');
  const [deliveryType, setDeliveryType] = useState(null); // 'express' ou 'scheduled'
  const [scheduledSubType, setScheduledSubType] = useState(null); // 'delivery' ou 'shipment'
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
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
    isPaid: '', // 'yes' ou 'no'
    deliveryType: 'scheduled', // Par défaut programmée
    scheduledDate: '',
    scheduledTime: '',
    estimatedDeliveryPrice: 0,
    // Shipment specific fields
    packageValue: '',
    destinationAddress: ''
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null); // For modal

  const navigate = useNavigate();

  useEffect(() => {
    loadMyRequests();
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const announcementsList = await getAnnouncements();
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return '#3b82f6';
      case 'promo': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'important': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'info': return 'Information';
      case 'promo': return 'Promotion';
      case 'warning': return 'Avertissement';
      case 'important': return 'Important';
      default: return type;
    }
  };

  const loadMyRequests = async () => {
    try {
      // Load all requests from Firebase
      const requestsList = await getDeliveryRequests();
      setRequests(requestsList);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversList = await getDrivers();
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
    setMessage('📍 Demande de localisation en cours...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        callback(location);
        setGeoLoading(false);
        setMessage('✅ Localisation obtenue avec succès');
        setTimeout(() => setMessage(''), 2000);
      },
      (error) => {
        let errorMsg = '❌ Erreur de géolocalisation: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permission refusée. Veuillez autoriser l\'accès à votre position.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Position indisponible.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Délai dépassé.';
            break;
          default:
            errorMsg += error.message;
        }
        setMessage(errorMsg);
        console.error('Geolocation error:', error);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
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
        receiverAddress: `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      }));
    });
  };

  // Get sender location (for form)
  const handleGetSenderLocation = () => {
    requestGeolocation((location) => {
      setDeliveryRequest(prev => ({
        ...prev,
        senderLat: location.latitude,
        senderLng: location.longitude,
        senderAddress: `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
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
    // Validation for shipment type
    if (deliveryType === 'scheduled' && scheduledSubType === 'shipment') {
      if (!deliveryRequest.receiverName || !deliveryRequest.receiverPhone) {
        setMessage('❌ Le nom et le téléphone du destinataire sont obligatoires');
        return;
      }
      if (!deliveryRequest.receiverAddress || !deliveryRequest.receiverAddress.trim()) {
        setMessage('❌ L\'adresse de destination est obligatoire');
        return;
      }
      if (!deliveryRequest.description || !deliveryRequest.description.trim()) {
        setMessage('❌ La description du colis est obligatoire');
        return;
      }
      if (!deliveryRequest.packageValue || parseFloat(deliveryRequest.packageValue) <= 0) {
        setMessage('❌ La valeur du colis doit être spécifiée et supérieure à 0');
        return;
      }

      // Create shipment request
      try {
        setLoading(true);
        const shipmentData = {
          receiverName: deliveryRequest.receiverName,
          receiverPhone: deliveryRequest.receiverPhone,
          receiverAddress: deliveryRequest.receiverAddress,
          description: deliveryRequest.description,
          packagePrice: parseFloat(deliveryRequest.packageValue),
          weight: deliveryRequest.weight ? parseFloat(deliveryRequest.weight) : null,
          type: 'shipment',
          status: 'pending'
        };

        await createPackage(shipmentData);
        setMessage('✅ Demande d\'expédition créée ! L\'admin va fixer le tarif et vous notifier.');
        
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
          isPaid: '',
          deliveryType: 'scheduled',
          scheduledDate: '',
          scheduledTime: '',
          estimatedDeliveryPrice: 0,
          packageValue: '',
          destinationAddress: ''
        });
        setDeliveryType(null);
        setScheduledSubType(null);
        setTimeout(() => setMessage(''), 5000);
      } catch (error) {
        setMessage('❌ Erreur lors de la création de l\'expédition');
        console.error('Error:', error);
        if (error.response?.data?.message) {
          setMessage(`❌ ${error.response.data.message}`);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Original validation for express and scheduled local deliveries
    if (!deliveryRequest.senderName || !deliveryRequest.senderPhone) {
      setMessage('❌ Votre nom et téléphone sont obligatoires');
      return;
    }
    if (!deliveryRequest.receiverName || !deliveryRequest.receiverPhone) {
      setMessage('❌ Le nom et le téléphone du destinataire sont obligatoires');
      return;
    }
    if (!deliveryRequest.description || !deliveryRequest.description.trim()) {
      setMessage('❌ La description du colis est obligatoire');
      return;
    }
    if (!deliveryRequest.weight || parseFloat(deliveryRequest.weight) <= 0) {
      setMessage('❌ Le poids du colis doit être spécifié et supérieur à 0');
      return;
    }
    if (!deliveryRequest.packagePrice || parseFloat(deliveryRequest.packagePrice) <= 0) {
      setMessage('❌ La valeur du colis doit être spécifiée et supérieure à 0');
      return;
    }
    if (!deliveryRequest.isPaid) {
      setMessage('❌ Veuillez spécifier si le colis est payé ou non');
      return;
    }
    if (deliveryType === 'scheduled' && scheduledSubType === 'delivery' && (!deliveryRequest.scheduledDate || !deliveryRequest.scheduledTime)) {
      setMessage('❌ Veuillez sélectionner une date et un créneau horaire');
      return;
    }

    try {
      setLoading(true);
      const newRequest = {
        senderName: deliveryRequest.senderName,
        senderPhone: deliveryRequest.senderPhone,
        senderAddress: deliveryRequest.senderAddress || '',
        senderLat: deliveryRequest.senderLat || null,
        senderLng: deliveryRequest.senderLng || null,
        receiverName: deliveryRequest.receiverName,
        receiverPhone: deliveryRequest.receiverPhone,
        receiverAddress: deliveryRequest.receiverAddress || '',
        receiverLat: deliveryRequest.receiverLat || null,
        receiverLng: deliveryRequest.receiverLng || null,
        description: deliveryRequest.description,
        weight: parseFloat(deliveryRequest.weight),
        packagePrice: parseFloat(deliveryRequest.packagePrice),
        isPaid: deliveryRequest.isPaid === 'yes',
        deliveryType: deliveryType,
        ...(deliveryType === 'express' && selectedDriver && !selectedDriver.skip && {
          distanceKm: selectedDriver.distance,
          deliveryPrice: selectedDriver.estimatedPrice
        }),
        ...(deliveryType === 'scheduled' && scheduledSubType === 'delivery' && {
          scheduledDate: deliveryRequest.scheduledDate,
          timeSlot: deliveryRequest.scheduledTime,
        })
      };

      const newRequestData = await createDeliveryRequest(newRequest);
      setRequests([...requests, newRequestData]);
      const messageText = deliveryType === 'express' 
        ? (selectedDriver ? '✅ Demande express créée ! Le livreur est en route' : '✅ Demande express créée ! L\'admin assignera un livreur')
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
        isPaid: '',
        deliveryType: 'scheduled',
        scheduledDate: '',
        scheduledTime: '',
        estimatedDeliveryPrice: 0,
        packageValue: '',
        destinationAddress: ''
      });
      setDeliveryType(null);
      setScheduledSubType(null);
      setSelectedDriver(null);
      setUserLocation(null);
      setTimeout(() => setMessage(''), 3000);
      setTimeout(() => setActiveTab('my-requests'), 1000);
    } catch (error) {
      setMessage('❌ Erreur lors de la création de la demande');
      console.error('Error:', error);
      if (error.response?.data?.message) {
        setMessage(`❌ ${error.response.data.message}`);
      }
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
    <>
      <div className="page-layout client-portal">
        <header className="page-header client-header">
          <h1>🛵 BETEX EXPRESS</h1>
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}>
            Déconnexion
          </button>
        </header>

        <main className="page-content client-main">
          {/* Announcements Section */}
          {!announcementsLoading && announcements.length > 0 && (
            <div className="client-announcements">
              <div className="announcements-label">📢 Annonces</div>
              <div className="client-announcements-list">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className="client-announcement-card"
                    style={{ borderLeftColor: getTypeColor(announcement.type) }}
                  >
                    <div className="client-announcement-header">
                      <span 
                        className="client-announcement-type"
                        style={{ backgroundColor: getTypeColor(announcement.type) }}
                      >
                        {getTypeName(announcement.type)}
                      </span>
                      <span className="client-announcement-date">
                        {new Date(announcement.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h4 className="client-announcement-title">{announcement.title}</h4>
                    <p className="client-announcement-content">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <button
            className="tab-btn"
            onClick={() => navigate('/client/shipments')}
          >
            📮 Mes Expéditions
          </button>
        </div>

        {message && (
          <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
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

                    {/* Scheduled Delivery (with sub-options) */}
                    <div 
                      className="delivery-type-card scheduled"
                      onClick={() => setDeliveryType('scheduled')}
                    >
                      <div className="type-icon">📅</div>
                      <h3>Livraison Programmée</h3>
                      <p className="type-description">Programmez votre livraison locale ou une expédition</p>
                      <ul className="type-features">
                        <li>✓ Livraison locale programmée</li>
                        <li>✓ Expédition nationale/internationale</li>
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
                          
                          <button 
                            type="button" 
                            className="btn-submit-request"
                            onClick={() => setSelectedDriver({ skip: true })}
                          >
                            Continuer sans sélectionner de livreur
                          </button>
                        </div>
                      ) : (
                        <div className="no-drivers">
                          <p>⚠️ Aucun livreur disponible à proximité pour le moment</p>
                          <p>Mais vous pouvez quand même créer la demande ! Un admin assignera un livreur disponible.</p>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            <button 
                              type="button"
                              className="btn-submit-request"
                              onClick={() => setSelectedDriver({ skip: true })}
                            >
                              Continuer et créer la demande
                            </button>
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
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Scheduled Delivery - Sub-type Selection */}
              {deliveryType === 'scheduled' && !scheduledSubType && (
                <div className="scheduled-subtype-selection">
                  <div className="form-header">
                    <button 
                      type="button"
                      className="btn-back"
                      onClick={() => {
                        setDeliveryType(null);
                      }}
                    >
                      ← Retour
                    </button>
                    <h2>📅 Livraison Programmée</h2>
                    <p>Choisissez le type de livraison programmée</p>
                  </div>

                  <div className="delivery-type-grid">
                    {/* Local Scheduled Delivery */}
                    <div 
                      className="delivery-type-card scheduled"
                      onClick={() => setScheduledSubType('delivery')}
                    >
                      <div className="type-icon">🚚</div>
                      <h3>Livraison Locale</h3>
                      <p className="type-description">Programmez une livraison dans votre région</p>
                      <ul className="type-features">
                        <li>✓ Choisir date et créneau horaire</li>
                        <li>✓ Admin assigne le livreur</li>
                        <li>✓ Livraison dans votre ville</li>
                      </ul>
                    </div>

                    {/* Shipment (Expédition) */}
                    <div 
                      className="delivery-type-card shipment"
                      onClick={() => setScheduledSubType('shipment')}
                    >
                      <div className="type-icon">📮</div>
                      <h3>Expédition</h3>
                      <p className="type-description">Envoi national/international</p>
                      <ul className="type-features">
                        <li>✓ Envoi longue distance</li>
                        <li>✓ Tarif fixé par admin après</li>
                        <li>✓ Suivi avec numéro tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduled Delivery Form */}
              {deliveryType === 'scheduled' && scheduledSubType === 'delivery' && (
                <div className="scheduled-delivery-flow">
                  <div className="form-header">
                    <button 
                      type="button"
                      className="btn-back"
                      onClick={() => {
                        setScheduledSubType(null);
                      }}
                    >
                      ← Retour
                    </button>
                    <h2>📅 Livraison Locale Programmée</h2>
                    <p>Programmez votre livraison locale. Un admin assignera le livreur approprié.</p>
                  </div>

                  <form className="delivery-form">
                    <fieldset>
                      <legend>⏰ Sélectionnez votre créneau de collecte</legend>
                      
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
                      </div>

                      {/* Time Slot Selection */}
                      <div className="time-slots-selection">
                        <p className="slots-info">Choisissez votre créneau de collecte préféré:</p>
                        
                        <div className="slots-grid">
                          {/* Morning Slot */}
                          <div 
                            className={`slot-card ${deliveryRequest.scheduledTime === '07:00-10:00' ? 'selected' : ''}`}
                            onClick={() => setDeliveryRequest(prev => ({
                              ...prev,
                              scheduledTime: '07:00-10:00'
                            }))}
                          >
                            <div className="slot-icon">☀️</div>
                            <h4>Collecte du Matin</h4>
                            <p className="slot-time">7h00 - 10h00</p>
                            <p className="slot-description">Collecte en début de journée</p>
                            {deliveryRequest.scheduledTime === '07:00-10:00' && (
                              <div className="slot-check">✓ Sélectionné</div>
                            )}
                          </div>

                          {/* Evening Slot */}
                          <div 
                            className={`slot-card ${deliveryRequest.scheduledTime === '15:00-17:00' ? 'selected' : ''}`}
                            onClick={() => setDeliveryRequest(prev => ({
                              ...prev,
                              scheduledTime: '15:00-17:00'
                            }))}
                          >
                            <div className="slot-icon">🌙</div>
                            <h4>Collecte du Soir</h4>
                            <p className="slot-time">15h00 - 17h00</p>
                            <p className="slot-description">Collecte en fin d'après-midi</p>
                            {deliveryRequest.scheduledTime === '15:00-17:00' && (
                              <div className="slot-check">✓ Sélectionné</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </form>
                </div>
              )}

              {/* Shipment (Expédition) Form */}
              {deliveryType === 'scheduled' && scheduledSubType === 'shipment' && (
                <div className="shipment-flow">
                  <div className="form-header">
                    <button 
                      type="button"
                      className="btn-back"
                      onClick={() => {
                        setScheduledSubType(null);
                      }}
                    >
                      ← Retour
                    </button>
                    <h2>📮 Expédition</h2>
                    <p>Créez votre demande d'expédition. L'admin fixera le tarif et vous recevrez une notification.</p>
                  </div>

                  <form className="delivery-form">
                    <fieldset>
                      <legend>📥 Informations du Destinataire</legend>
                      
                      <div className="form-group">
                        <label>Nom complet du destinataire <span className="required">*</span></label>
                        <input
                          type="text"
                          name="receiverName"
                          value={deliveryRequest.receiverName}
                          onChange={handleDeliveryChange}
                          placeholder="Nom et prénom"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Numéro du destinataire <span className="required">*</span></label>
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
                        <label>Adresse de destination <span className="required">*</span></label>
                        <textarea
                          name="receiverAddress"
                          value={deliveryRequest.receiverAddress}
                          onChange={handleDeliveryChange}
                          placeholder="Adresse complète de destination"
                          rows="2"
                          required
                        />
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>📦 Nature du Colis</legend>
                      
                      <div className="form-group">
                        <label>Description du colis <span className="required">*</span></label>
                        <textarea
                          name="description"
                          value={deliveryRequest.description}
                          onChange={handleDeliveryChange}
                          placeholder="Décrivez le contenu du colis..."
                          rows="3"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Poids approximatif (kg)</label>
                          <input
                            type="number"
                            name="weight"
                            value={deliveryRequest.weight}
                            onChange={handleDeliveryChange}
                            placeholder="Ex: 2.5"
                            step="0.1"
                          />
                        </div>

                        <div className="form-group">
                          <label>Valeur du colis (FCFA) <span className="required">*</span></label>
                          <input
                            type="number"
                            name="packageValue"
                            value={deliveryRequest.packageValue}
                            onChange={handleDeliveryChange}
                            placeholder="Ex: 50000"
                            required
                          />
                        </div>
                      </div>
                    </fieldset>

                    <div className="shipment-info-box">
                      <h4>ℹ️ Comment ça marche ?</h4>
                      <ol>
                        <li>Vous créez la demande d'expédition</li>
                        <li>L'administrateur examine votre demande</li>
                        <li>L'admin fixe le montant d'expédition et les frais</li>
                        <li>Vous recevez une notification avec le tarif</li>
                        <li>Vous validez et payez</li>
                        <li>Votre colis est expédié avec un numéro de suivi</li>
                      </ol>
                      <p className="note">💡 Les champs "Montant expédition" et "Statut" seront visibles après traitement par Betex</p>
                    </div>

                    <button
                      type="button"
                      className="btn-submit-request"
                      onClick={handleRequestDelivery}
                      disabled={loading}
                    >
                      {loading ? '⏳ Envoi...' : '📤 Créer la demande d\'expédition'}
                    </button>
                  </form>
                </div>
              )}

              {/* Form Section - Show after driver selection (express) or with scheduled delivery setup */}
              {deliveryType && ((deliveryType === 'express' && selectedDriver) || (deliveryType === 'scheduled' && scheduledSubType === 'delivery')) && (
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
                      readOnly={deliveryRequest.senderLat && deliveryRequest.senderLng}
                    />
                    <button 
                      type="button"
                      className="btn-get-location-small"
                      onClick={handleGetSenderLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? '⏳' : deliveryRequest.senderLat && deliveryRequest.senderLng ? '✅' : '📍'} Localisation
                    </button>
                    {deliveryRequest.senderLat && deliveryRequest.senderLng && (
                      <div className="coordinates-display">
                        📍 Coordonnées: {deliveryRequest.senderLat.toFixed(4)}, {deliveryRequest.senderLng.toFixed(4)}
                      </div>
                    )}
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
                      readOnly={deliveryRequest.receiverLat && deliveryRequest.receiverLng}
                    />
                    <button 
                      type="button"
                      className="btn-get-location-small"
                      onClick={handleGetReceiverLocation}
                      disabled={geoLoading}
                    >
                      {geoLoading ? '⏳' : deliveryRequest.receiverLat && deliveryRequest.receiverLng ? '✅' : '📍'} Localisation
                    </button>
                    {deliveryRequest.receiverLat && deliveryRequest.receiverLng && (
                      <div className="coordinates-display">
                        📍 Coordonnées: {deliveryRequest.receiverLat.toFixed(4)}, {deliveryRequest.receiverLng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>📦 Détails du Colis</legend>
                  
                  <div className="form-group">
                    <label>Description du contenu <span className="required">*</span></label>
                    <textarea
                      name="description"
                      value={deliveryRequest.description}
                      onChange={handleDeliveryChange}
                      placeholder="Ex: Vêtements, électronique, nourriture, documents..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Poids (kg) <span className="required">*</span></label>
                      <input
                        type="number"
                        name="weight"
                        value={deliveryRequest.weight}
                        onChange={handleDeliveryChange}
                        placeholder="Ex: 0.5, 2.3..."
                        step="0.1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Valeur du colis (FCFA) <span className="required">*</span></label>
                      <input
                        type="number"
                        name="packagePrice"
                        value={deliveryRequest.packagePrice}
                        onChange={handleDeliveryChange}
                        placeholder="Ex: 50000"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Statut du paiement <span className="required">*</span></label>
                    <div className="payment-status-options">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="isPaid"
                          value="yes"
                          checked={deliveryRequest.isPaid === 'yes'}
                          onChange={handleDeliveryChange}
                          required
                        />
                        <span className="radio-label">💳 Déjà Payé</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="isPaid"
                          value="no"
                          checked={deliveryRequest.isPaid === 'no'}
                          onChange={handleDeliveryChange}
                          required
                        />
                        <span className="radio-label">⏳ À Payer à la Livraison</span>
                      </label>
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
                <div className="requests-grid">
                  {requests.map(request => (
                    <div
                      key={request.id}
                      className={`mini-card status-${request.status}`}
                      onClick={() => {
                        setSelectedRequest(request);
                      }}
                    >
                      <div className="mini-card-top">
                        <div className="status-dot"></div>
                        <div className="mini-type">
                          {request.deliveryType === 'express' ? '⚡' : '📅'}
                        </div>
                        <div className="mini-id">
                          #{request.trackingNumber || request.id.substring(0, 6)}
                        </div>
                      </div>
                      
                      <div className="mini-card-main">
                        <div className="mini-name">
                          <span className="mini-icon">📤</span>
                          <span>{request.senderName}</span>
                        </div>
                        <div className="mini-arrow">→</div>
                        <div className="mini-name">
                          <span className="mini-icon">📥</span>
                          <span>{request.receiverName}</span>
                        </div>
                      </div>

                      <div className="mini-card-bottom">
                        {/* Delivery Price: ONLY SHOW IF APPROVED OR LATER */}
                        {request.deliveryPrice != null && ['approved', 'in_transit', 'completed'].includes(request.status) && (
                          <span className="mini-price">
                            🚚 {Math.round(Number(request.deliveryPrice)).toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                        {/* Package Value (always show if available) */}
                        {request.packagePrice > 0 && (
                          <span className="mini-package-value">
                            📦 {Math.round(Number(request.packagePrice)).toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Request Details Modal - Outside page-layout to avoid stacking issues */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>
                  #{selectedRequest.trackingNumber || selectedRequest.id.substring(0, 8)}
                </h2>
                <span className={`type-badge-modal type-${selectedRequest.deliveryType}`}>
                  {selectedRequest.deliveryType === 'express' ? '⚡ Express' : '📅 Programmée'}
                </span>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <div className="section-title">📋 Statut</div>
                <div className="info-grid">
                  <div className="full-width">
                    <span className="info-value">
                      <span className={`status-badge status-${selectedRequest.status}`} style={{ display: 'inline-flex' }}>
                        {getStatusBadge(selectedRequest.status)}
                      </span>
                    </span>
                  </div>
                  <div><label>Date de la demande:</label><p>{new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}</p></div>
                </div>
              </div>

              <div className="info-section">
                <div className="section-title">📤 Départ</div>
                <div className="info-grid">
                  <div><label>Nom:</label><p>{selectedRequest.senderName || 'Non spécifié'}</p></div>
                  <div><label>Téléphone:</label><p>{selectedRequest.senderPhone || 'Non spécifié'}</p></div>
                  {selectedRequest.senderAddress && (
                    <div className="full-width"><label>Adresse:</label><p>{selectedRequest.senderAddress}</p></div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <div className="section-title">📥 Destination</div>
                <div className="info-grid">
                  <div><label>Nom:</label><p>{selectedRequest.receiverName || 'Non spécifié'}</p></div>
                  <div><label>Téléphone:</label><p>{selectedRequest.receiverPhone || 'Non spécifié'}</p></div>
                  {selectedRequest.receiverAddress && (
                    <div className="full-width"><label>Adresse:</label><p>{selectedRequest.receiverAddress}</p></div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <div className="section-title">📦 Colis & Tarif</div>
                <div className="info-grid">
                  {selectedRequest.description && (
                    <div className="full-width"><label>Description du colis:</label><p>{selectedRequest.description}</p></div>
                  )}
                  {selectedRequest.weight && (
                    <div><label>Poids du colis:</label><p>{selectedRequest.weight} kg</p></div>
                  )}
                  {selectedRequest.packagePrice > 0 && (
                    <div><label>Valeur du colis:</label><p>{Math.round(Number(selectedRequest.packagePrice)).toLocaleString('fr-FR')} FCFA</p></div>
                  )}
                  <div><label>Statut du paiement:</label><p>{selectedRequest.isPaid ? '💳 Déjà payé' : '⏳ À payer à la livraison'}</p></div>
                  {selectedRequest.deliveryPrice != null && ['approved', 'in_transit', 'completed'].includes(selectedRequest.status) && (
                    <div><label>Prix de la livraison:</label><p style={{ fontWeight: 700, color: '#7c3aed' }}>{Math.round(Number(selectedRequest.deliveryPrice)).toLocaleString('fr-FR')} FCFA</p></div>
                  )}
                  {/* Show note if pending and no price */}
                  {selectedRequest.status === 'pending_approval' && (
                    <div className="full-width">
                      <p style={{ color: '#047857', fontStyle: 'italic' }}>
                        ⏳ Le prix de livraison sera affiché après approbation par l'administrateur
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.driverName && (
                <div className="info-section">
                  <div className="section-title">👨‍🚚 Livreur</div>
                  <div className="info-grid">
                    <div><label>Nom:</label><p>{selectedRequest.driverName}</p></div>
                    {selectedRequest.driverPhone && (
                      <div><label>Téléphone:</label><p>{selectedRequest.driverPhone}</p></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientPortal;
