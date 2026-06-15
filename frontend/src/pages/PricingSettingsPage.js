/**
 * Pricing Settings Page
 * Admin can configure delivery pricing based on distance
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPricing, updatePricing } from '../services/firebaseService';
import '../styles/PricingSettingsPage.css';
import '../styles/PageLayout.css';

const PricingSettingsPage = () => {
  const [pricingConfig, setPricingConfig] = useState(null);
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('express');
  const [newZone, setNewZone] = useState({ name: '', price: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load pricing from API on mount
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricing = await getPricing();
        setPricingConfig(pricing);
        setFormData({ ...pricing });
      } catch (error) {
        console.error('Error loading pricing:', error);
        setMessage('❌ Erreur lors du chargement des tarifs');
      } finally {
        setLoading(false);
      }
    };
    loadPricing();
  }, []);

  const handleExpressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      express: {
        ...prev.express,
        [field]: field === 'basePrice' || field === 'pricePerKm' || field === 'minPrice' || field === 'maxPrice' 
          ? parseInt(value) || 0 
          : value
      }
    }));
    setHasChanges(true);
  };

  const handleZoneChange = (zoneId, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduled: {
        ...prev.scheduled,
        zones: prev.scheduled.zones.map(zone => 
          zone.id === zoneId 
            ? { ...zone, [field]: field === 'price' ? parseInt(value) || 0 : value }
            : zone
        )
      }
    }));
    setHasChanges(true);
  };

  const handleAddZone = () => {
    if (!newZone.name || !newZone.price) {
      setMessage('❌ Veuillez remplir tous les champs');
      return;
    }

    const zone = {
      id: `zone-${Date.now()}`,
      name: newZone.name,
      price: parseInt(newZone.price)
    };

    setFormData(prev => ({
      ...prev,
      scheduled: {
        ...prev.scheduled,
        zones: [...prev.scheduled.zones, zone]
      }
    }));

    setNewZone({ name: '', price: '' });
    setMessage('✅ Zone ajoutée');
    setHasChanges(true);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteZone = (zoneId) => {
    setFormData(prev => ({
      ...prev,
      scheduled: {
        ...prev.scheduled,
        zones: prev.scheduled.zones.filter(zone => zone.id !== zoneId)
      }
    }));
    setHasChanges(true);
    setMessage('✅ Zone supprimée');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    try {
      setMessage('⏳ Sauvegarde en cours...');
      await updatePricing(formData);
      setPricingConfig(formData);
      setHasChanges(false);
      setMessage('✅ Configuration sauvegardée avec succès!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      setMessage('❌ Erreur lors de la sauvegarde');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculatePrice = (distance) => {
    const { basePrice, pricePerKm, minPrice, maxPrice } = formData.express;
    const calculated = basePrice + (distance * pricePerKm);
    return Math.max(minPrice, Math.min(maxPrice, calculated));
  };

  if (loading) {
    return (
      <div className="page-layout pricing-settings-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#e2e8f0', fontSize: '1.5rem' }}>⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-layout pricing-settings-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour
        </button>
        <h1>💰 Configuration des Tarifs de Livraison</h1>
      </header>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="page-content pricing-container">
        {/* Tabs */}
        <div className="pricing-tabs">
          <button
            className={`tab-btn ${activeTab === 'express' ? 'active' : ''}`}
            onClick={() => setActiveTab('express')}
          >
            ⚡ Express (Distance)
          </button>
          <button
            className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            📅 Programmée (Zones)
          </button>
        </div>

        {/* Express Pricing */}
        {activeTab === 'express' && (
          <div className="pricing-section">
            <h2>⚡ Tarification Express (Basée sur la Distance)</h2>
            <p className="section-description">
              Configurez le calcul des tarifs pour les livraisons express basées sur la distance
            </p>

            <div className="pricing-form">
              <div className="form-row">
                <div className="form-group">
                  <label>💵 Prix de Base (FCFA) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formData.express.basePrice}
                    onChange={(e) => handleExpressChange('basePrice', e.target.value)}
                    placeholder="500"
                  />
                  <small>Prix minimum pour toute livraison express</small>
                </div>

                <div className="form-group">
                  <label>📏 Prix par km (FCFA) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formData.express.pricePerKm}
                    onChange={(e) => handleExpressChange('pricePerKm', e.target.value)}
                    placeholder="250"
                  />
                  <small>Prix supplémentaire par kilomètre</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>⬇️ Prix Minimum (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.express.minPrice}
                    onChange={(e) => handleExpressChange('minPrice', e.target.value)}
                    placeholder="500"
                  />
                  <small>Le prix ne peut pas descendre en dessous de cette valeur</small>
                </div>

                <div className="form-group">
                  <label>⬆️ Prix Maximum (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.express.maxPrice}
                    onChange={(e) => handleExpressChange('maxPrice', e.target.value)}
                    placeholder="10000"
                  />
                  <small>Le prix ne peut pas dépasser cette valeur</small>
                </div>
              </div>

              {/* Price Examples */}
              <div className="examples-section">
                <h3>📊 Exemples de Calcul</h3>
                <div className="examples-grid">
                  <div className="example-card">
                    <span className="example-distance">5 km</span>
                    <span className="example-price">{calculatePrice(5).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="example-card">
                    <span className="example-distance">10 km</span>
                    <span className="example-price">{calculatePrice(10).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="example-card">
                    <span className="example-distance">20 km</span>
                    <span className="example-price">{calculatePrice(20).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="example-card">
                    <span className="example-distance">50 km</span>
                    <span className="example-price">{calculatePrice(50).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Formula Display */}
              <div className="formula-section">
                <h3>📐 Formule de Calcul</h3>
                <div className="formula-box">
                  <code>
                    Prix = MAX(Min, MIN(Max, Base + Distance × ParKm))<br/>
                    Prix = MAX({formData.express.minPrice}, MIN({formData.express.maxPrice}, {formData.express.basePrice} + Distance × {formData.express.pricePerKm}))
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Pricing */}
        {activeTab === 'scheduled' && (
          <div className="pricing-section">
            <h2>📅 Tarification Programmée (Basée sur les Zones)</h2>
            <p className="section-description">
              Configurez les tarifs fixes par zone géographique
            </p>

            <div className="pricing-form">
              {/* Existing Zones */}
              <div className="zones-list">
                <h3>🗺️ Zones Existantes</h3>
                {formData.scheduled.zones.length === 0 ? (
                  <p className="no-data">Aucune zone configurée</p>
                ) : (
                  formData.scheduled.zones.map(zone => (
                    <div key={zone.id} className="zone-card">
                      <div className="zone-header">
                        <h4>{zone.name}</h4>
                        <button
                          className="btn-delete-zone"
                          onClick={() => handleDeleteZone(zone.id)}
                          title="Supprimer cette zone"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="zone-content">
                        <label>Nom de la Zone</label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => handleZoneChange(zone.id, 'name', e.target.value)}
                          placeholder="Ex: Zone Centre-Ville"
                        />

                        <label>Prix (FCFA)</label>
                        <input
                          type="number"
                          min="0"
                          value={zone.price}
                          onChange={(e) => handleZoneChange(zone.id, 'price', e.target.value)}
                          placeholder="1500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Zone */}
              <div className="add-zone-section">
                <h3>➕ Ajouter une Nouvelle Zone</h3>
                <div className="add-zone-form">
                  <div className="form-group">
                    <label>Nom de la Zone <span className="required">*</span></label>
                    <input
                      type="text"
                      value={newZone.name}
                      onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Zone Ouest"
                    />
                  </div>

                  <div className="form-group">
                    <label>Prix (FCFA) <span className="required">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={newZone.price}
                      onChange={(e) => setNewZone(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="1500"
                    />
                  </div>

                  <button className="btn-add-zone" onClick={handleAddZone}>
                    ➕ Ajouter la Zone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="actions-section">
          <button
            className={`btn-save ${!hasChanges ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            💾 Sauvegarder les Modifications
          </button>
          <button
            className="btn-cancel"
            onClick={() => {
              setFormData({ ...pricingConfig });
              setHasChanges(false);
            }}
          >
            ↺ Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingSettingsPage;
