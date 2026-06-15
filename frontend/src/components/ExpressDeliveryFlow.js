import React, { useState, useMemo, useEffect } from 'react';
import '../styles/DeliveryFlow.css';
import { getPricing } from '../services/firebaseService';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

const calculateDistanceToDriver = (driver, pickupLocation) => {
  if (!driver || !pickupLocation || !pickupLocation.latitude || !pickupLocation.longitude) {
    return 0;
  }
  return haversineDistance(
    driver.currentLat || driver.lastLatitude || 0,
    driver.currentLng || driver.lastLongitude || 0,
    pickupLocation.latitude,
    pickupLocation.longitude
  );
};

const calculateExpressPrice = (distance, pricing) => {
  const basePrice = pricing?.basePrice || 500;
  const pricePerKm = pricing?.pricePerKm || 250;
  return Math.round(basePrice + (distance * pricePerKm));
};

const ExpressDeliveryFlow = ({ 
  drivers: propDrivers, 
  selectedDriver, 
  onSelectDriver, 
  pickupLocation,
  deliveryLocation,
  onPricingCalculate 
}) => {
  const [drivers, setDrivers] = useState(propDrivers);
  const [pricing, setPricing] = useState(null);
  const [showDriverList, setShowDriverList] = useState(false);
  const [driverDistances, setDriverDistances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDrivers(propDrivers);
  }, [propDrivers]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const pricingData = await getPricing();
        setPricing(pricingData);
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  // Calculate real distances from all drivers to pickup location
  useEffect(() => {
    if (pickupLocation && pickupLocation.latitude && pickupLocation.longitude && drivers.length > 0) {
      const distances = {};
      drivers.forEach(driver => {
        distances[driver.id] = calculateDistanceToDriver(driver, pickupLocation);
      });
      setDriverDistances(distances);
    }
  }, [pickupLocation, drivers]);

  // Sort drivers by real distance
  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => {
      const distA = driverDistances[a.id] || 999;
      const distB = driverDistances[b.id] || 999;
      return distA - distB;
    });
  }, [drivers, driverDistances]);

  const handleSelectDriver = (driver) => {
    const distance = driverDistances[driver.id] || 0;
    const calculatedPrice = calculateExpressPrice(distance, pricing);
    
    onSelectDriver(driver);
    onPricingCalculate({
      deliveryOption: 'express',
      pricingModel: 'distance_based',
      basePrice: pricing?.basePrice || 500,
      pricePerKm: pricing?.pricePerKm || 250,
      distance: distance,
      totalPrice: calculatedPrice,
      driverId: driver.id,
      driverName: driver.name
    });
    setShowDriverList(false);
  };

  return (
    <div className="delivery-flow-container">
      <h3>🚀 LIVRAISON EXPRESS</h3>

      {loading ? (
        <div className="loading-container">
          <p>Chargement des données...</p>
        </div>
      ) : (
        <>
          <div className="flow-section">
            <h4>📍 Distance et Tarif</h4>
            {pickupLocation ? (
              <div className="distance-info">
                <p>✓ Localisation d'enlèvement: {pickupLocation.address}</p>
                {deliveryLocation && (
                  <p>✓ Localisation de livraison: {deliveryLocation.address}</p>
                )}
                <p className="pricing-formula">
                  💰 <strong>Tarification:</strong> {pricing?.basePrice || 500} FCFA (base) + (distance × {pricing?.pricePerKm || 250} FCFA/km)
                </p>
              </div>
            ) : (
              <div className="alert alert-warning">
                ⚠️ Veuillez d'abord sélectionner la localisation d'enlèvement
              </div>
            )}
          </div>

          <div className="flow-section">
            <div className="section-header">
              <h4>👤 Sélectionnez votre livreur</h4>
              <button
                type="button"
                className={`btn-toggle ${showDriverList ? 'active' : ''}`}
                onClick={() => setShowDriverList(!showDriverList)}
              >
                {showDriverList ? '▼ Masquer' : '▶ Afficher'} ({sortedDrivers.length} disponibles)
              </button>
            </div>

            {showDriverList && (
              <div className="drivers-list-express">
                {sortedDrivers.map(driver => {
                  const distance = driverDistances[driver.id] || 0;
                  const price = calculateExpressPrice(distance, pricing);
                  const isSelected = selectedDriver?.id === driver.id;

                  return (
                    <div
                      key={driver.id}
                      className={`driver-card-express ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectDriver(driver)}
                    >
                      <div className="driver-card-header">
                        <div className="driver-basic">
                          <h5>👤 {driver.name}</h5>
                          <span className={`rating-badge rating-${Math.floor(driver.rating)}`}>
                            ⭐ {driver.rating}
                          </span>
                        </div>
                        <div className="driver-distance">
                          <span className="distance-value">{distance} km</span>
                          <span className="price-value">{price} FCFA</span>
                        </div>
                      </div>

                      <div className="driver-card-body">
                        <div className="info-row">
                          <span className="label">📝 CNIB:</span>
                          <span className="value">{driver.cnib || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">📞 Tél:</span>
                          <span className="value">{driver.phone}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">🚗 Véhicule:</span>
                          <span className="value">
                            {driver.vehicleType || 'N/A'}
                            {driver.vehiclePlate ? ` - ${driver.vehiclePlate}` : ''}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">📦 Colis:</span>
                          <span className="value">
                            {driver.assignedPackages || 0} en cours | {driver.completedToday || 0} livrés
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="driver-selected-indicator">
                          <span>✅ SÉLECTIONNÉ</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDriver && (
            <div className="driver-summary-express">
              <h4>✅ Livreur Sélectionné</h4>
              <div className="summary-content">
                <div className="summary-row">
                  <span>👤 Nom:</span>
                  <strong>{selectedDriver.name}</strong>
                </div>
                <div className="summary-row">
                  <span>📝 CNIB:</span>
                  <strong>{selectedDriver.cnib || 'N/A'}</strong>
                </div>
                <div className="summary-row">
                  <span>🚗 Véhicule:</span>
                  <strong>
                    {selectedDriver.vehicleType || 'N/A'}
                    {selectedDriver.vehiclePlate ? ` (${selectedDriver.vehiclePlate})` : ''}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>📏 Distance:</span>
                  <strong>{driverDistances[selectedDriver.id] || 0} km</strong>
                </div>
                <div className="summary-row highlight">
                  <span>💰 Prix de livraison:</span>
                  <strong>{calculateExpressPrice(driverDistances[selectedDriver.id] || 0, pricing)} FCFA</strong>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpressDeliveryFlow;
