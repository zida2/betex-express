import React, { useState, useMemo } from 'react';
import '../styles/DeliveryFlow.css';

const ScheduledDeliveryFlow = ({ 
  deliveryLocation, 
  selectedTimeSlot, 
  onSelectTimeSlot, 
  onPricingCalculate 
}) => {
  const [showZones, setShowZones] = useState(false);

  // Demo data - Zones with pricing
  const demoZones = [
    {
      id: 'zone-1',
      name: 'Zone Plateau',
      description: 'Centre-ville, Plateau',
      price: 1500,
      deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
      coverage: 'Abidjan Centre'
    },
    {
      id: 'zone-2',
      name: 'Zone Treichville',
      description: 'Treichville, Adjamé',
      price: 1200,
      deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
      coverage: 'Treichville, Adjamé, Marcory'
    },
    {
      id: 'zone-3',
      name: 'Zone Yopougon',
      description: 'Yopougon, Abobo',
      price: 1000,
      deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
      coverage: 'Yopougon, Abobo, Songon'
    },
    {
      id: 'zone-4',
      name: 'Zone Cocody',
      description: 'Cocody, Deux-Plateaux',
      price: 2000,
      deliveryTime: '9h00 - 12h00 ou 14h00 - 17h00',
      coverage: 'Cocody, Deux-Plateaux, Bingerville'
    }
  ];

  // Time slots for scheduled delivery (2 per day)
  const timeSlots = [
    {
      id: 'slot-1',
      label: 'Créneau du matin',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 50,
      booked: 42,
      available: true
    },
    {
      id: 'slot-2',
      label: 'Créneau de l\'après-midi',
      startTime: '14:00',
      endTime: '17:00',
      capacity: 50,
      booked: 38,
      available: true
    }
  ];

  // Determine zone based on delivery location (demo logic)
  const determineZone = () => {
    // For demo: randomly assign a zone based on location
    if (!deliveryLocation) return null;
    // In real app, this would use geospatial lookup
    return demoZones[0]; // Default to first zone for demo
  };

  const selectedZone = useMemo(() => determineZone(), [deliveryLocation]);

  const handleSelectTimeSlot = (slot) => {
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
              {selectedZone && (
                <>
                  <p>✓ Zone détectée: <strong>{selectedZone.name}</strong></p>
                  <p>📦 Couverture: {selectedZone.coverage}</p>
                </>
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
                {demoZones.map(zone => (
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
            💰 <strong>Tarif Zone {selectedZone.name}:</strong> {selectedZone.price} FCFA
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
