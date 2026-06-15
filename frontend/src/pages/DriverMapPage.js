/**
 * Driver Map Page
 * Interactive map showing pickup and delivery route for the driver
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPackages, updatePackage } from '../services/firebaseService';
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
      const packages = await getPackages();
      const pkg = packages.find(p => p.id === packageId);
      
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

    // Vérifier que Leaflet est chargé
    if (!window.L) {
      console.error('Leaflet not loaded');
      return;
    }

    const newMap = window.L.map('driver-map').setView([driverPosition.lat, driverPosition.lng], 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(newMap);

    // Icône du livreur (position actuelle)
    const driverIcon = window.L.divIcon({
      html: '<div style="background: linear-gradient(135deg, #00d4ff 0%, #7b2ff7 100%); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,212,255,0.6);">🚚</div>',
      iconSize: [50, 50],
      className: 'driver-marker'
    });

    window.L.marker([driverPosition.lat, driverPosition.lng], { icon: driverIcon })
      .addTo(newMap)
      .bindPopup('<b>🚚 Ma position</b><br>Jean Kouassi');

    // Point de livraison
    if (packageData.deliveryLatitude && packageData.deliveryLongitude) {
      const deliveryIcon = window.L.divIcon({
        html: '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(16,185,129,0.6);">🎯</div>',
        iconSize: [40, 40],
        className: 'delivery-marker'
      });

      window.L.marker([packageData.deliveryLatitude, packageData.deliveryLongitude], { icon: deliveryIcon })
        .addTo(newMap)
        .bindPopup(`<b>🎯 LIVRAISON</b><br><strong>${packageData.customerName || packageData.receiverName}</strong><br>${packageData.address || packageData.receiverAddress}`);
    }

    // Tracer l'itinéraire
    drawRoute(newMap);

    setMap(newMap);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updatePackage(packageId, { status: newStatus });
      // Recharger les données
      loadPackageData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const drawRoute = (mapInstance) => {
    const waypoints = [];

    // Point de départ (livreur)
    waypoints.push([driverPosition.lat, driverPosition.lng]);

    // Point de livraison directement
    if (packageData.deliveryLatitude && packageData.deliveryLongitude) {
      waypoints.push([packageData.deliveryLatitude, packageData.deliveryLongitude]);
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

  const deliveryDistance = driverPosition && packageData.deliveryLatitude && packageData.deliveryLongitude
    ? calculateDistance(driverPosition.lat, driverPosition.lng, packageData.deliveryLatitude, packageData.deliveryLongitude)
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