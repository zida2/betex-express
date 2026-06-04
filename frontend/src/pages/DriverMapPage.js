/**
 * Driver Map Page
 * Interactive map showing pickup and delivery route for the driver
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DriverMapPage.css';

const DriverMapPage = () => {
  const { packageId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [currentStep, setCurrentStep] = useState('pickup'); // 'pickup' or 'delivery'

  useEffect(() => {
    loadPackageData();
    getCurrentPosition();
  }, [packageId]);

  useEffect(() => {
    if (packageData && driverPosition && window.L) {
      initializeMap();
    }
  }, [packageData, driverPosition]);

  const loadPackageData = async () => {
    try {
      const response = await api.get('/packages', {
        params: { driverId: user.id }
      });
      
      const packages = response.data.data || [];
      const pkg = packages.find(p => p.id.toString() === packageId);
      
      if (pkg) {
        setPackageData(pkg);
        // Les livreurs reçoivent directement des colis à livrer (pas de pickup)
        setCurrentStep('delivery');
      } else {
        console.error('Package not found');
      }
    } catch (error) {
      console.error('Failed to load package:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Position par défaut à Ouagadougou
          setDriverPosition({
            lat: 12.3714,
            lng: -1.5197
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Position par défaut
      setDriverPosition({
        lat: 12.3714,
        lng: -1.5197
      });
    }
  };

  const initializeMap = () => {
    if (map) {
      map.remove();
    }

    const newMap = window.L.map('driver-map').setView([driverPosition.lat, driverPosition.lng], 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(newMap);

    // Icône du livreur (position actuelle)
    const driverIcon = window.L.divIcon({
      html: '<div style="background: #00d4ff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🚚</div>',
      iconSize: [40, 40],
      className: 'driver-marker'
    });

    window.L.marker([driverPosition.lat, driverPosition.lng], { icon: driverIcon })
      .addTo(newMap)
      .bindPopup('<b>🚚 Ma position</b><br>Jean Kouassi');

    // Point de livraison
    if (packageData.receiverLat && packageData.receiverLng) {
      const deliveryIcon = window.L.divIcon({
        html: '<div style="background: #10b981; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🎯</div>',
        iconSize: [35, 35],
        className: 'delivery-marker'
      });

      window.L.marker([packageData.receiverLat, packageData.receiverLng], { icon: deliveryIcon })
        .addTo(newMap)
        .bindPopup(`<b>🎯 LIVRAISON</b><br>${packageData.receiverName}<br>${packageData.receiverAddress}`);
    }

    // Tracer l'itinéraire
    drawRoute(newMap);

    setMap(newMap);
  };

  const drawRoute = (mapInstance) => {
    const waypoints = [];

    // Point de départ (livreur)
    waypoints.push([driverPosition.lat, driverPosition.lng]);

    // Point de livraison directement
    if (packageData.receiverLat && packageData.receiverLng) {
      waypoints.push([packageData.receiverLat, packageData.receiverLng]);
    }

    // Tracer la ligne entre le livreur et la destination
    if (waypoints.length === 2) {
      const routeLine = window.L.polyline(waypoints, {
        color: '#00d4ff',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(mapInstance);

      // Ajuster la vue pour inclure tous les points
      mapInstance.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/packages/${packageId}/status`, { status: newStatus });
      // Recharger les données
      loadPackageData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading || !packageData) {
    return <div className="loading">Chargement de la carte...</div>;
  }

  const pickupDistance = driverPosition && packageData.pickupLat && packageData.pickupLng
    ? calculateDistance(driverPosition.lat, driverPosition.lng, packageData.pickupLat, packageData.pickupLng)
    : 0;

  const deliveryDistance = driverPosition && packageData.receiverLat && packageData.receiverLng
    ? calculateDistance(driverPosition.lat, driverPosition.lng, packageData.receiverLat, packageData.receiverLng)
    : 0;

  return (
    <div className="driver-map-page">
      <header className="map-header">
        <button className="btn-back" onClick={() => navigate('/driver/dashboard')}>
          ← Retour
        </button>
        <h1>🗺️ Itinéraire - {packageData.trackingNumber}</h1>
      </header>

      {/* Info Panel */}
      <div className="route-info">
        <div className="route-steps">
          <div className={`step-card active`}>
            <div className="step-icon">🎯</div>
            <div className="step-content">
              <h3>Livraison</h3>
              <p>{packageData.receiverName}</p>
              <span className="distance">{deliveryDistance.toFixed(1)} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div id="driver-map" className="map-container"></div>

      {/* Action Panel */}
      <div className="action-panel">
        {packageData.status === 'collected' && (
          <button 
            className="btn-action btn-primary"
            onClick={() => handleStatusUpdate('in_delivery')}
          >
            🚚 Commencer livraison
          </button>
        )}

        {packageData.status === 'in_delivery' && (
          <div className="delivery-actions">
            <button 
              className="btn-action btn-success"
              onClick={() => handleStatusUpdate('delivered')}
            >
              ✅ Livré avec succès
            </button>
            <button 
              className="btn-action btn-danger"
              onClick={() => handleStatusUpdate('delivery_failed')}
            >
              ❌ Échec de livraison
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverMapPage;