/**
 * Delivery Location Capture Page
 * Destinatary clicks link from WhatsApp to capture their delivery location
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeliveryRequest, updateDeliveryRequest } from '../services/firebaseService';
import '../styles/DeliveryLocationCapture.css';

const DeliveryLocationCapture = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [request, setRequest] = useState(null);

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const req = await getDeliveryRequest(requestId);
      setRequest(req);
    } catch (error) {
      console.error('Failed to load request:', error);
      setMessage('❌ Demande non trouvée');
    }
  };

  // Request geolocation from user
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setMessage('❌ Géolocalisation non supportée par votre navigateur');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setGeoLoading(false);
        
        // Auto-confirm after capture
        handleConfirmLocation(latitude, longitude);
      },
      (error) => {
        setMessage('❌ Veuillez activer la géolocalisation pour continuer');
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

  const handleConfirmLocation = async (lat, lng) => {
    if (!lat || !lng) {
      setMessage('❌ Veuillez capturer votre localisation d\'abord');
      return;
    }

    try {
      setLoading(true);
      
      // Update request with captured location
      await updateDeliveryRequest(requestId, {
        receiverLat: lat,
        receiverLng: lng,
        receiverLocationConfirmed: true,
        locationCapturedAt: new Date()
      });

      setMessage('✅ Localisation confirmée avec succès!');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/client');
      }, 2000);
    } catch (error) {
      setMessage('❌ Erreur lors de la confirmation de localisation');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-location-capture">
      <div className="capture-container">
        <div className="capture-header">
          <h1>📍 Confirmer votre localisation de livraison</h1>
          <p>Cliquez sur le bouton ci-dessous pour activer votre GPS</p>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="capture-content">
          {request ? (
            <div className="request-info">
              <div className="info-item">
                <strong>Demande #:</strong> {request.id}
              </div>
              <div className="info-item">
                <strong>Destinataire:</strong> {request.receiverName}
              </div>
              <div className="info-item">
                <strong>Téléphone:</strong> {request.receiverPhone}
              </div>
              {request.description && (
                <div className="info-item">
                  <strong>Description:</strong> {request.description}
                </div>
              )}
            </div>
          ) : null}

          <div className="location-section">
            {location ? (
              <div className="location-success">
                <div className="success-icon">✓</div>
                <h2>Localisation capturée</h2>
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
                <button 
                  className="btn-confirm"
                  onClick={() => handleConfirmLocation(location.latitude, location.longitude)}
                  disabled={loading}
                >
                  {loading ? '⏳ Confirmation...' : '✓ Confirmer'}
                </button>
              </div>
            ) : (
              <button
                className="btn-capture"
                onClick={handleCaptureLocation}
                disabled={geoLoading}
              >
                {geoLoading ? (
                  <>
                    <div className="spinner"></div>
                    Activation du GPS...
                  </>
                ) : (
                  <>
                    📍 Activer mon GPS pour confirmer ma localisation
                  </>
                )}
              </button>
            )}
          </div>

          <div className="capture-info">
            <h3>ℹ️ Informations</h3>
            <ul>
              <li>Votre localisation sera utilisée pour optimiser la livraison</li>
              <li>Le livreur pourra vous contacter à {request?.receiverPhone}</li>
              <li>Assurez-vous d'avoir activé la géolocalisation sur votre appareil</li>
              <li>La précision peut varier selon votre environnement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLocationCapture;
