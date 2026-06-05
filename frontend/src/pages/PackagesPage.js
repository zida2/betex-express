import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import DeliveryOptions from '../components/DeliveryOptions';
import ExpressDeliveryFlow from '../components/ExpressDeliveryFlow';
import ScheduledDeliveryFlow from '../components/ScheduledDeliveryFlow';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/PackagesPage.css';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Delivery options state
  const [deliveryOption, setDeliveryOption] = useState(null); // 'express' or 'scheduled'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  
  // Legacy state for backward compatibility
  const [suggestedDriver, setSuggestedDriver] = useState(null);
  const [findingDriver, setFindingDriver] = useState(false);
  const [showDriverSelection, setShowDriverSelection] = useState(false);
  
  const [formData, setFormData] = useState({
    senderName: '', senderPhone: '', senderAddress: '', senderLatitude: '', senderLongitude: '',
    receiverName: '', receiverPhone: '', receiverAddress: '', receiverLatitude: '', receiverLongitude: '',
    packageType: '', packagePrice: '', deliveryPrice: '', weight: '', notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [packagesRes, driversRes] = await Promise.all([
        api.get('/packages'),
        api.get('/drivers')
      ]);
      setPackages(Array.isArray(packagesRes.data.data) ? packagesRes.data.data : []);
      const driversData = driversRes.data.data?.drivers || driversRes.data.data || [];
      setDrivers(driversData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSenderLocationSelect = (location) => {
    setFormData({
      ...formData,
      senderAddress: location.address,
      senderLatitude: location.latitude,
      senderLongitude: location.longitude
    });
  };

  const handleReceiverLocationSelect = (location) => {
    setFormData({
      ...formData,
      receiverAddress: location.address,
      receiverLatitude: location.latitude,
      receiverLongitude: location.longitude
    });
  };

  const findNearestDriver = async () => {
    if (!formData.senderLatitude || !formData.senderLongitude) {
      alert('Veuillez entrer la localisation de l\'expediteur');
      return;
    }

    setFindingDriver(true);
    try {
      const response = await api.post('/optimization/suggest-driver', {
        latitude: parseFloat(formData.senderLatitude),
        longitude: parseFloat(formData.senderLongitude)
      });
      setSuggestedDriver(response.data.data?.driver || response.data.data);
      setSelectedDriver(response.data.data?.driver || response.data.data);
      setShowDriverSelection(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Impossible de trouver un livreur');
    } finally {
      setFindingDriver(false);
    }
  };

  const handleManualDriverSelection = () => {
    setShowDriverSelection(!showDriverSelection);
    setSuggestedDriver(null);
  };

  const selectDriver = (driver) => {
    setSelectedDriver(driver);
    setShowDriverSelection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on delivery option
    if (!deliveryOption) {
      alert('Veuillez choisir un type de livraison (Express ou Programmée)');
      return;
    }

    if (deliveryOption === 'express' && !selectedDriver) {
      alert('Veuillez sélectionner un livreur pour la livraison Express');
      return;
    }

    if (deliveryOption === 'scheduled' && !selectedTimeSlot) {
      alert('Veuillez sélectionner un créneau horaire pour la livraison Programmée');
      return;
    }

    if (!pricingInfo) {
      alert('Erreur: Les informations de tarification ne sont pas disponibles');
      return;
    }

    try {
      const payload = {
        customerName: formData.receiverName,
        customerPhone: formData.receiverPhone,
        address: formData.receiverAddress,
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderAddress: formData.senderAddress,
        senderLatitude: parseFloat(formData.senderLatitude),
        senderLongitude: parseFloat(formData.senderLongitude),
        deliveryLatitude: parseFloat(formData.receiverLatitude),
        deliveryLongitude: parseFloat(formData.receiverLongitude),
        packageType: formData.packageType,
        packagePrice: formData.packagePrice ? parseFloat(formData.packagePrice) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes,
        deliveryOption: deliveryOption,
        deliveryPrice: pricingInfo.totalPrice
      };

      if (deliveryOption === 'express') {
        payload.driverId = selectedDriver.id;
        payload.pricingModel = 'distance_based';
        payload.distance = selectedDriver.distance;
      } else {
        payload.timeSlotId = selectedTimeSlot.id;
        payload.zone = pricingInfo.zone?.id;
        payload.pricingModel = 'zone_based';
      }

      await api.post('/packages', payload);

      alert(`✅ Livraison ${deliveryOption === 'express' ? 'Express' : 'Programmée'} créée avec succès!`);
      
      // Reset form
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setDeliveryOption(null);
    setSuggestedDriver(null);
    setSelectedDriver(null);
    setSelectedTimeSlot(null);
    setPricingInfo(null);
    setShowDriverSelection(false);
    setFormData({
      senderName: '', senderPhone: '', senderAddress: '', senderLatitude: '', senderLongitude: '',
      receiverName: '', receiverPhone: '', receiverAddress: '', receiverLatitude: '', receiverLongitude: '',
      packageType: '', packagePrice: '', deliveryPrice: '', weight: '', notes: ''
    });
  };

  if (loading) {
    return React.createElement('div', { className: 'loading' }, 'Chargement...');
  }

  return (
    <div className="packages-page">
      <header className="page-header">
        <h1>Gestion des Colis</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouvelle livraison'}
        </button>
      </header>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="package-form">
            <h3>EXPEDITEUR</h3>
            
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                required
                placeholder="Nom de l'expediteur"
              />
            </div>

            <div className="form-group">
              <label>Telephone *</label>
              <input
                type="tel"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleChange}
                required
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <LocationPicker
              label="Localisation de l'expediteur *"
              onLocationSelect={handleSenderLocationSelect}
              initialAddress={formData.senderAddress}
              initialLat={formData.senderLatitude}
              initialLng={formData.senderLongitude}
            />

            <h3>DESTINATAIRE</h3>
            
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                required
                placeholder="Nom du destinataire"
              />
            </div>

            <div className="form-group">
              <label>Telephone *</label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                required
                placeholder="+225 XX XX XX XX XX"
              />
            </div>

            <LocationPicker
              label="Localisation du destinataire *"
              onLocationSelect={handleReceiverLocationSelect}
              initialAddress={formData.receiverAddress}
              initialLat={formData.receiverLatitude}
              initialLng={formData.receiverLongitude}
            />

            <h3>INFORMATIONS COLIS</h3>
            
            <div className="form-group">
              <label>Type de colis *</label>
              <select
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                required
              >
                <option value="">-- Selectionner --</option>
                <option value="document">Document</option>
                <option value="colis">Colis</option>
                <option value="nourriture">Nourriture</option>
                <option value="fragile">Fragile</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prix du colis (FCFA)</label>
                <input
                  type="number"
                  name="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="0.5"
                step="0.1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Notes / Instructions</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instructions speciales pour le livreur..."
                rows="3"
              />
            </div>

            {/* NEW: DELIVERY OPTIONS SECTION */}
            <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
            <h3>📦 TYPE DE LIVRAISON</h3>
            
            <DeliveryOptions 
              selectedOption={deliveryOption}
              onSelectOption={setDeliveryOption}
            />

            {/* EXPRESS DELIVERY FLOW */}
            {deliveryOption === 'express' && (
              <ExpressDeliveryFlow
                drivers={drivers}
                selectedDriver={selectedDriver}
                onSelectDriver={setSelectedDriver}
                pickupLocation={{
                  address: formData.senderAddress,
                  latitude: parseFloat(formData.senderLatitude) || null,
                  longitude: parseFloat(formData.senderLongitude) || null
                }}
                deliveryLocation={{
                  address: formData.receiverAddress,
                  latitude: parseFloat(formData.receiverLatitude) || null,
                  longitude: parseFloat(formData.receiverLongitude) || null
                }}
                onPricingCalculate={setPricingInfo}
              />
            )}

            {/* SCHEDULED DELIVERY FLOW */}
            {deliveryOption === 'scheduled' && (
              <ScheduledDeliveryFlow
                deliveryLocation={{
                  address: formData.receiverAddress,
                  latitude: parseFloat(formData.receiverLatitude) || null,
                  longitude: parseFloat(formData.receiverLongitude) || null
                }}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
                onPricingCalculate={setPricingInfo}
              />
            )}

            {/* PRICING REVIEW */}
            {pricingInfo && (
              <div className="pricing-review-section">
                <h4>💰 Résumé du Tarif</h4>
                <div className="pricing-breakdown">
                  <div className="breakdown-row">
                    <span>Type de livraison:</span>
                    <strong>{deliveryOption === 'express' ? '🚀 Express' : '📅 Programmée'}</strong>
                  </div>
                  {deliveryOption === 'express' && (
                    <>
                      <div className="breakdown-row">
                        <span>Distance:</span>
                        <strong>{pricingInfo.distance} km</strong>
                      </div>
                      <div className="breakdown-row">
                        <span>Prix base:</span>
                        <strong>{pricingInfo.basePrice} FCFA</strong>
                      </div>
                      <div className="breakdown-row">
                        <span>Prix distance:</span>
                        <strong>{(pricingInfo.distance * pricingInfo.pricePerKm)} FCFA</strong>
                      </div>
                    </>
                  )}
                  {deliveryOption === 'scheduled' && (
                    <>
                      <div className="breakdown-row">
                        <span>Zone:</span>
                        <strong>{pricingInfo.zone?.name}</strong>
                      </div>
                      <div className="breakdown-row">
                        <span>Créneau:</span>
                        <strong>{pricingInfo.timeSlot?.label} ({pricingInfo.deliveryTimeRange})</strong>
                      </div>
                    </>
                  )}
                  <div className="breakdown-row total">
                    <span>💰 Total:</span>
                    <strong>{pricingInfo.totalPrice} FCFA</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => resetForm()}
              >
                ❌ Annuler
              </button>
              <button
                type="submit"
                className="btn-success"
                disabled={!deliveryOption || !pricingInfo}
              >
                {deliveryOption && pricingInfo
                  ? '✅ Confirmer la Livraison'
                  : '⚠️ Complétez le formulaire'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="packages-list">
        <h2>Liste des livraisons</h2>
        {packages.length === 0 ? (
          <div className="empty-state">
            <p>Aucune livraison enregistree</p>
          </div>
        ) : (
          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="package-card">
                <div className="package-header">
                  <span className={`status-badge status-${pkg.status}`}>
                    {getStatusIcon(pkg.status)} {translateStatus(pkg.status)}
                  </span>
                  <span className="package-type">{pkg.packageType}</span>
                </div>
                <div className="package-info">
                  <p><strong>De:</strong> {pkg.senderName} ({pkg.senderPhone})</p>
                  <p><strong>À:</strong> {pkg.customerName} ({pkg.customerPhone})</p>
                  <p><strong>Prix livraison:</strong> {pkg.deliveryPrice} FCFA</p>
                  {pkg.packagePrice > 0 && (
                    <p><strong>Prix colis:</strong> {pkg.packagePrice} FCFA</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
