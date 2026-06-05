import React from 'react';
import '../styles/DeliveryOptions.css';

const DeliveryOptions = ({ selectedOption, onSelectOption }) => {
  return (
    <div className="delivery-options-container">
      <h3>⏱️ CHOISIR LE TYPE DE LIVRAISON</h3>
      
      <div className="delivery-options-grid">
        {/* Express Delivery Option */}
        <div
          className={`delivery-option ${selectedOption === 'express' ? 'selected' : ''}`}
          onClick={() => onSelectOption('express')}
        >
          <div className="option-icon">🚀</div>
          <div className="option-content">
            <h4>Livraison Express</h4>
            <p className="option-subtitle">Immédiat</p>
            <ul className="option-features">
              <li>✓ Livraison aujourd'hui</li>
              <li>✓ Choisissez votre livreur</li>
              <li>✓ Tarif selon distance</li>
            </ul>
            <div className="price-range">
              Prix: Calculé selon distance
            </div>
          </div>
          <div className="option-selector">
            {selectedOption === 'express' && <div className="checkmark">✓</div>}
          </div>
        </div>

        {/* Scheduled Delivery Option */}
        <div
          className={`delivery-option ${selectedOption === 'scheduled' ? 'selected' : ''}`}
          onClick={() => onSelectOption('scheduled')}
        >
          <div className="option-icon">📅</div>
          <div className="option-content">
            <h4>Livraison Programmée</h4>
            <p className="option-subtitle">Flexible</p>
            <ul className="option-features">
              <li>✓ Deux créneaux par jour</li>
              <li>✓ Choisissez votre créneau</li>
              <li>✓ Tarif selon zone</li>
            </ul>
            <div className="price-range">
              Prix: 1000 - 2000 FCFA
            </div>
          </div>
          <div className="option-selector">
            {selectedOption === 'scheduled' && <div className="checkmark">✓</div>}
          </div>
        </div>
      </div>

      {selectedOption && (
        <div className="option-selected-info">
          <p>
            {selectedOption === 'express' 
              ? '✓ Livraison Express sélectionnée - Sélectionnez un livreur ci-dessous'
              : '✓ Livraison Programmée sélectionnée - Choisissez un créneau ci-dessous'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryOptions;
