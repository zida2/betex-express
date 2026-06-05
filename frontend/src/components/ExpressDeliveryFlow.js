import React, { useState, useMemo, useEffect } from 'react';
import '../styles/DeliveryFlow.css';
import { 
  calculateDistanceToDriver, 
  calculateExpressPrice,
  DEMO_EXPRESS_DRIVERS 
} from '../utils/demoData';

const ExpressDeliveryFlow = ({ 
  drivers, 
  selectedDriver, 
  onSelectDriver, 
  pickupLocation,
  deliveryLocation,
  onPricingCalculate 
}) => {
  const [showDriverList, setShowDriverList] = useState(false);
  const [driverDistances, setDriverDistances] = useState({});

  // Calculate real distances from all drivers to pickup location
  useEffect(() => {
    if (pickupLocation && pickupLocation.latitude && pickupLocation.longitude) {
      const distances = {};
      DEMO_EXPRESS_DRIVERS.forEach(driver => {
        distances[driver.id] = calculateDistanceToDriver(driver, pickupLocation);
      });
      setDriverDistances(distances);
    }
  }, [pickupLocation]);

  // Sort drivers by real distance
  const sortedDrivers = useMemo(() => {
    return [...DEMO_EXPRESS_DRIVERS].sort((a, b) => {
      const distA = driverDistances[a.id] || 999;
      const distB = driverDistances[b.id] || 999;
      return distA - distB;
    });
  }, [driverDistances]);

  const handleSelectDriver = (driver) => {
    const distance = driverDistances[driver.id] || 0;
    const calculatedPrice = calculateExpressPrice(distance);
    
    onSelectDriver(driver);
    onPricingCalculate({
      deliveryOption: 'express',
      pricingModel: 'distance_based',
      basePrice: 500,
      pricePerKm: 250,
      distance: distance,
      totalPrice: calculatedPrice,
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`
    });
    setShowDriverList(false);
  };

  return (
    <div className="delivery-flow-container">
      <h3>🚀 LIVRAISON EXPRESS</h3>

      <div className="flow-section">
        <h4>📍 Distance et Tarif</h4>
        {pickupLocation ? (
          <div className="distance-info">
            <p>✓ Localisation d'enlèvement: {pickupLocation.address}</p>
            {deliveryLocation && (
              <p>✓ Localisation de livraison: {deliveryLocation.address}</p>
            )}
            <p className="pricing-formula">
              💰 <strong>Tarification:</strong> 500 FCFA (base) + (distance × 250 FCFA/km)
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
              const price = calculateExpressPrice(distance);
              const isSelected = selectedDriver?.id === driver.id;

              return (
                <div
                  key={driver.id}
                  className={`driver-card-express ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectDriver(driver)}
                >
                  <div className="driver-card-header">
                    <div className="driver-basic">
                      <h5>👤 {driver.firstName} {driver.lastName}</h5>
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
                      <span className="value">{driver.cnib}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📞 Tél:</span>
                      <span className="value">{driver.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">🚗 Véhicule:</span>
                      <span className="value">{driver.vehicleType} - {driver.vehiclePlate}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📦 Colis:</span>
                      <span className="value">
                        {driver.assignedPackages} en cours | {driver.completedToday} livrés
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
              <strong>{selectedDriver.firstName} {selectedDriver.lastName}</strong>
            </div>
            <div className="summary-row">
              <span>📝 CNIB:</span>
              <strong>{selectedDriver.cnib}</strong>
            </div>
            <div className="summary-row">
              <span>🚗 Véhicule:</span>
              <strong>{selectedDriver.vehicleType} ({selectedDriver.vehiclePlate})</strong>
            </div>
            <div className="summary-row">
              <span>📏 Distance:</span>
              <strong>{driverDistances[selectedDriver.id] || 0} km</strong>
            </div>
            <div className="summary-row highlight">
              <span>💰 Prix de livraison:</span>
              <strong>{calculateExpressPrice(driverDistances[selectedDriver.id] || 0)} FCFA</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressDeliveryFlow;
