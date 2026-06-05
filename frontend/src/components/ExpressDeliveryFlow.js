import React, { useState, useMemo } from 'react';
import '../styles/DeliveryFlow.css';

const ExpressDeliveryFlow = ({ 
  drivers, 
  selectedDriver, 
  onSelectDriver, 
  pickupLocation,
  onPricingCalculate 
}) => {
  const [showDriverList, setShowDriverList] = useState(false);

  // Demo data - Available drivers for Express delivery
  const demoExpressDrivers = [
    {
      id: 'driver-1',
      firstName: 'Jean',
      lastName: 'Kouame',
      cnib: '01234567',
      phone: '+225 07 55 55 55 55',
      email: 'jean.kouame@mail.com',
      vehicleType: 'Moto',
      vehiclePlate: 'AB-123-CD',
      status: 'available',
      rating: 4.8,
      distance: 2.5,
      latitude: 6.8276,
      longitude: -5.2893,
      completedToday: 12,
      assignedPackages: 2
    },
    {
      id: 'driver-2',
      firstName: 'Marie',
      lastName: 'Diallo',
      cnib: '02345678',
      phone: '+225 01 66 66 66 66',
      email: 'marie.diallo@mail.com',
      vehicleType: 'Voiture',
      vehiclePlate: 'EF-456-GH',
      status: 'available',
      rating: 4.6,
      distance: 3.1,
      latitude: 6.8250,
      longitude: -5.2850,
      completedToday: 18,
      assignedPackages: 1
    },
    {
      id: 'driver-3',
      firstName: 'Ahmed',
      lastName: 'Ibrahim',
      cnib: '03456789',
      phone: '+225 05 77 77 77 77',
      email: 'ahmed.ibrahim@mail.com',
      vehicleType: 'Moto',
      vehiclePlate: 'IJ-789-KL',
      status: 'available',
      rating: 4.7,
      distance: 1.8,
      latitude: 6.8300,
      longitude: -5.2900,
      completedToday: 15,
      assignedPackages: 3
    },
    {
      id: 'driver-4',
      firstName: 'Sophie',
      lastName: 'Blanc',
      cnib: '04567890',
      phone: '+225 09 88 88 88 88',
      email: 'sophie.blanc@mail.com',
      vehicleType: 'Voiture',
      vehiclePlate: 'MN-012-OP',
      status: 'available',
      rating: 4.9,
      distance: 4.2,
      latitude: 6.8200,
      longitude: -5.2800,
      completedToday: 22,
      assignedPackages: 0
    }
  ];

  // Calculate distance-based pricing
  const calculateExpressPrice = (distance) => {
    const BASE_PRICE = 500; // Base price in FCFA
    const PRICE_PER_KM = 250; // Price per km in FCFA
    return BASE_PRICE + (distance * PRICE_PER_KM);
  };

  // Sort drivers by distance
  const sortedDrivers = useMemo(() => {
    return [...demoExpressDrivers].sort((a, b) => a.distance - b.distance);
  }, []);

  const handleSelectDriver = (driver) => {
    onSelectDriver(driver);
    const calculatedPrice = calculateExpressPrice(driver.distance);
    onPricingCalculate({
      deliveryOption: 'express',
      pricingModel: 'distance_based',
      basePrice: 500,
      pricePerKm: 250,
      distance: driver.distance,
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
              const price = calculateExpressPrice(driver.distance);
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
                      <span className="distance-value">{driver.distance} km</span>
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
              <strong>{selectedDriver.distance} km</strong>
            </div>
            <div className="summary-row highlight">
              <span>💰 Prix de livraison:</span>
              <strong>{calculateExpressPrice(selectedDriver.distance)} FCFA</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressDeliveryFlow;
