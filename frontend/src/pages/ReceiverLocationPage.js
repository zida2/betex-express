/**
 * Receiver Location Page
 * Page where receiver shares their GPS location via link
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDeliveryRequestByToken, updateDeliveryRequest } from '../services/firebaseService';
import '../styles/ReceiverLocationPage.css';

const ReceiverLocationPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, getting, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const req = await getDeliveryRequestByToken(token);
      if (!req) {
        throw new Error('Invalid token');
      }
      setDeliveryInfo(req);
      
      // Si localisation déjà fournie
      if (req.receiverLat && req.receiverLng) {
        setLocationStatus('already-provided');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setError('Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setLocationStatus('getting');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Envoyer la localisation au backend
          await updateDeliveryRequest(deliveryInfo.id, {
            receiverLat: latitude,
            receiverLng: longitude,
            receiverLocationConfirmed: true,
            locationCapturedAt: new Date()
          });

          setLocationStatus('success');
          
          // Rediriger après 3 secondes
          setTimeout(() => {
            window.close(); // Tenter de fermer l'onglet
          }, 3000);
        } catch (error) {
          console.error('Error saving location:', error);
          setError('Erreur lors de l\'enregistrement de votre localisation');
          setLocationStatus('error');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Impossible d\'obtenir votre localisation';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé l\'accès à la localisation. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localisation non disponible. Vérifiez que votre GPS est activé.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
            break;
        }
        
        setError(errorMessage);
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loading) {
    return (
      <div className="location-page">
        <div className="location-card">
          <div className="loading-spinner">⏳</div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !deliveryInfo) {
    return (
      <div className="location-page">
        <div className="location-card error">
          <div className="icon">❌</div>
          <h2>Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-page">
      <div className="location-card">
        <div className="logo">
          <h1>🛵 BETEX EXPRESS</h1>
          <p className="tagline">Service de Livraison Professionnel</p>
        </div>

        {locationStatus === 'already-provided' ? (
          <div className="status-section success">
            <div className="icon">✅</div>
            <h2>Localisation Déjà Fournie</h2>
            <p>Vous avez déjà partagé votre localisation pour cette livraison.</p>
            <p className="info">Merci! Notre livreur vous contactera bientôt.</p>
          </div>
        ) : locationStatus === 'success' ? (
          <div className="status-section success">
            <div className="icon">✅</div>
            <h2>Localisation Enregistrée!</h2>
            <p>Merci d'avoir partagé votre localisation.</p>
            <p className="info">Notre équipe va maintenant traiter votre livraison.</p>
            <p className="small">Cette page va se fermer automatiquement...</p>
          </div>
        ) : locationStatus === 'getting' ? (
          <div className="status-section loading">
            <div className="loading-spinner">🌍</div>
            <h2>Localisation en cours...</h2>
            <p>Veuillez autoriser l'accès à votre position.</p>
          </div>
        ) : (
          <>
            <div className="delivery-info">
              <h2>📍 Partage de Localisation Sécurisé</h2>
              <p className="greeting">Bonjour <strong>{deliveryInfo?.receiverName}</strong>,</p>
              <p>Vous avez un colis en attente de livraison envoyé par <strong>{deliveryInfo?.senderName}</strong>.</p>
              
              <div className="package-info">
                <h3>📦 Détails de votre colis :</h3>
                <div className="package-details">
                  {deliveryInfo.description && (
                    <p><strong>📄 Description :</strong> {deliveryInfo.description}</p>
                  )}
                  {deliveryInfo.weight && (
                    <p><strong>⚖️ Poids :</strong> {deliveryInfo.weight} kg</p>
                  )}
                  {deliveryInfo.packagePrice > 0 && (
                    <p><strong>💎 Valeur du colis :</strong> {parseFloat(deliveryInfo.packagePrice).toLocaleString('fr-FR')} FCFA</p>
                  )}
                  {deliveryInfo.deliveryPrice != null && (
                    <p className="delivery-price"><strong>🚚 Prix de la livraison :</strong> {parseFloat(deliveryInfo.deliveryPrice).toLocaleString('fr-FR')} FCFA</p>
                  )}
                  {deliveryInfo.senderPhone && (
                    <p><strong>📞 Expéditeur :</strong> {deliveryInfo.senderPhone}</p>
                  )}
                </div>
              </div>

              <div className="instruction">
                <h3>🎯 Pour recevoir votre colis :</h3>
                <p>Notre livreur a besoin de votre position GPS précise pour vous localiser facilement.</p>
                <p className="security-note">🔒 <strong>Sécurisé :</strong> Votre localisation est protégée et utilisée uniquement pour cette livraison.</p>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <button 
              className="btn-share-location"
              onClick={handleShareLocation}
              disabled={locationStatus === 'getting'}
            >
              📍 Partager Ma Position GPS
            </button>

            <div className="privacy-note">
              <h4>🛡️ Confidentialité et Sécurité</h4>
              <ul>
                <li>✅ Votre localisation est cryptée et sécurisée</li>
                <li>✅ Utilisée uniquement pour cette livraison</li>
                <li>✅ Supprimée automatiquement après la livraison</li>
                <li>✅ Aucun partage avec des tiers</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiverLocationPage;
