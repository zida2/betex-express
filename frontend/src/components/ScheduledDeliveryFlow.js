import React, { useState, useMemo } from 'react';
import '../styles/DeliveryFlow.css';
import { 
  determineZoneByCoordinates, 
  DEMO_ZONES 
} from '../utils/demoData';

const ScheduledDeliveryFlow = ({ 
  deliveryLocation, 
  selectedTimeSlot, 
  onSelectTimeSlot, 
  onPricingCalculate 
}) => {
  const [showZones, setShowZones] = useState(false);
  const [zoneError, setZoneError] = useState(null);

  // Time slots for scheduled delivery (2 per day)
  const timeSlots = [
    {
      id: 'slot-1',
      label: 'Collecte du matin',
      startTime: '07:00',
      endTime: '10:00',
      capacity: 50,
      booked: 42,
      available: true
    },
    {
      id: 'slot-2',
      label: 'Collecte du soir',
      startTime: '15:00',
      endTime: '17:00',
      capacity: 50,
      booked: 38,
      available: true
    }
  ];

  // Determine zone based on delivery location using real geolocation
  const selectedZone = useMemo(() => {
    if (!deliveryLocation || !deliveryLocation.latitude || !deliveryLocation.longitude) {
      setZoneError(null);
      return null;
    }

    const zone = determineZoneByCoordinates(deliveryLocation.latitude, deliveryLocation.longitude);
    
    if (zone) {
      setZoneError(null);
      return zone;
    } else {
      setZoneError('📍 La localisation de livraison est en dehors de la zone de service');
      return null;
    }
  }, [deliveryLocation]);

  const handleSelectTimeSlot = (slot) => {
    if (!selectedZone) {
      alert('⚠️ Veuillez d\'abord sélectionner une localisation de livraison valide');
      return;
    }

    onSelectTimeSlot(slot);
    
    const pricing = {
      deliveryOption: 'scheduled',
      pricingModel: 'zone_based',
      zone: selectedZone,
      timeSlot: slot,
      totalPrice: selectedZone.price,
      deliveryDate: new Date().toLocaleDateString('fr-FR'),
      deliveryTimeRange: `${slot.startTime} - ${slot.endTime}`
    };

    onPricingCalculate(pricing);
  };

  const getAvailabilityText = (slot) => {
    const available = slot.capacity - slot.booked;
    const percentage = Math.round((available / slot.capacity) * 100);
    
    if (available <= 5) {
      return `⚠️ Presque complet (${available}/${slot.capacity})`;
    } else if (available <= 10) {
      return `⏱️ Limité (${available}/${slot.capacity})`;
    } else {
      return `✓ Disponible (${available}/${slot.capacity})`;
    }
  };

  return (
    <div className="delivery-flow-container">
      <h3>📅 LIVRAISON PROGRAMMÉE</h3>

      <div className="flow-section">
        <h4>📍 Zone de Livraison</h4>
        {deliveryLocation ? (
          <>
            <div className="zone-info">
              <p>✓ Adresse: {deliveryLocation.address}</p>
              {selectedZone ? (
                <>
                  <p>✓ Zone détectée: <strong>{selectedZone.name}</strong></p>
                  <p>📦 Couverture: {selectedZone.coverage}</p>
                  <p>💰 Tarif: <strong>{selectedZone.price} FCFA</strong></p>
                </>
              ) : zoneError ? (
                <div className="alert alert-error">
                  {zoneError}
                </div>
              ) : (
                <p className="zone-loading">🔍 Détection de la zone...</p>
              )}
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowZones(!showZones)}
            >
              {showZones ? '▼ Masquer les zones' : '▶ Voir toutes les zones'}
            </button>

            {showZones && (
              <div className="zones-list">
                {DEMO_ZONES.map(zone => (
                  <div
                    key={zone.id}
                    className={`zone-card ${selectedZone?.id === zone.id ? 'selected' : ''}`}
                  >
                    <div className="zone-header">
                      <h5>{zone.name}</h5>
                      <span className="zone-price">{zone.price} FCFA</span>
                    </div>
                    <p className="zone-description">{zone.description}</p>
                    <p className="zone-coverage">🏘️ {zone.coverage}</p>
                    <p className="zone-delivery">⏰ {zone.deliveryTime}</p>
                    {selectedZone?.id === zone.id && (
                      <div className="zone-selected">✓ Zone sélectionnée</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-warning">
            ⚠️ Veuillez d'abord sélectionner la localisation de livraison
          </div>
        )}
      </div>

      {selectedZone && (
        <div className="flow-section">
          <h4>⏰ Sélectionnez votre créneau horaire</h4>
          <p className="zone-selection-info">
            💰 <strong>Tarif Zone {selectedZone.name}:</strong> {selectedZone.price} FCFA (fixe)
          </p>

          <div className="time-slots-container">
            {timeSlots.map(slot => {
              const isSelected = selectedTimeSlot?.id === slot.id;
              const available = slot.capacity - slot.booked;
              const isAvailable = available > 0;

              return (
                <div
                  key={slot.id}
                  className={`time-slot-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                  onClick={() => isAvailable && handleSelectTimeSlot(slot)}
                >
                  <div className="slot-header">
                    <h5>{slot.label}</h5>
                    <span className={`slot-status ${isAvailable ? 'available' : 'full'}`}>
                      {getAvailabilityText(slot)}
                    </span>
                  </div>

                  <div className="slot-details">
                    <div className="detail-row">
                      <span className="label">⏰ Horaire:</span>
                      <span className="value">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">👥 Capacité:</span>
                      <span className="value">{slot.booked}/{slot.capacity}</span>
                    </div>
                  </div>

                  <div className="slot-capacity-bar">
                    <div
                      className="capacity-fill"
                      style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                    ></div>
                  </div>

                  {isSelected && (
                    <div className="slot-selected-indicator">
                      <span>✅ SÉLECTIONNÉ</span>
                    </div>
                  )}

                  {!isAvailable && (
                    <div className="slot-full-indicator">
                      <span>❌ COMPLET</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTimeSlot && selectedZone && (
        <div className="delivery-summary-scheduled">
          <h4>✅ Résumé de la Livraison Programmée</h4>
          <div className="summary-content">
            <div className="summary-row">
              <span>📍 Zone:</span>
              <strong>{selectedZone.name}</strong>
            </div>
            <div className="summary-row">
              <span>📅 Date:</span>
              <strong>{new Date().toLocaleDateString('fr-FR')}</strong>
            </div>
            <div className="summary-row">
              <span>⏰ Créneau:</span>
              <strong>{selectedTimeSlot.label} ({selectedTimeSlot.startTime} - {selectedTimeSlot.endTime})</strong>
            </div>
            <div className="summary-row">
              <span>🚚 Couverture:</span>
              <strong>{selectedZone.coverage}</strong>
            </div>
            <div className="summary-row highlight">
              <span>💰 Prix de livraison:</span>
              <strong>{selectedZone.price} FCFA</strong>
            </div>
            <div className="pricing-info">
              <p>💡 Le tarif est fixe selon la zone et ne changera pas pendant la livraison.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledDeliveryFlow;
