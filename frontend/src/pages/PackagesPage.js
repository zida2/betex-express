import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/PackagesPage.css';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suggestedDriver, setSuggestedDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
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
    
    if (!selectedDriver) {
      alert('Veuillez d\'abord choisir un livreur');
      return;
    }

    try {
      await api.post('/packages', {
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
        deliveryPrice: formData.deliveryPrice ? parseFloat(formData.deliveryPrice) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes,
        driverId: selectedDriver.id
      });
      
      alert('Livraison creee avec succes!');
      setShowForm(false);
      setSuggestedDriver(null);
      setSelectedDriver(null);
      setShowDriverSelection(false);
      setFormData({
        senderName: '', senderPhone: '', senderAddress: '', senderLatitude: '', senderLongitude: '',
        receiverName: '', receiverPhone: '', receiverAddress: '', receiverLatitude: '', receiverLongitude: '',
        packageType: '', packagePrice: '', deliveryPrice: '', weight: '', notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la creation');
    }
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

              <div className="form-group">
                <label>Prix de livraison (FCFA) *</label>
                <input
                  type="number"
                  name="deliveryPrice"
                  value={formData.deliveryPrice}
                  onChange={handleChange}
                  required
                  placeholder="1000"
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

            <div className="driver-selection-section">
              <div className="driver-buttons">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={findNearestDriver}
                  disabled={findingDriver}
                >
                  {findingDriver ? '🔍 Recherche...' : '🎯 Suggérer livreur proche'}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleManualDriverSelection}
                >
                  {showDriverSelection ? '✖ Annuler' : '👤 Choisir manuellement'}
                </button>
              </div>

              {showDriverSelection && (
                <div className="drivers-list-selection">
                  <h4>📋 LIVREURS DISPONIBLES</h4>
                  {drivers.filter(d => d.status === 'available' || d.status === 'active').map(driver => (
                    <div 
                      key={driver.id} 
                      className={`driver-option ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
                      onClick={() => selectDriver(driver)}
                    >
                      <div className="driver-option-header">
                        <strong>{driver.name}</strong>
                        <span className={`status-badge status-${driver.status}`}>
                          {translateStatus(driver.status)}
                        </span>
                      </div>
                      <p>📞 {driver.phone}</p>
                      <p>📦 {driver.assignedPackages || 0} colis en cours</p>
                      <p>✅ {driver.completedToday || 0} livrés aujourd'hui</p>
                    </div>
                  ))}
                </div>
              )}

              {suggestedDriver && (
                <div className="suggested-driver">
                  <h4>🎯 LIVREUR SUGGÉRÉ (LE PLUS PROCHE)</h4>
                  <div className="driver-details">
                    <p><strong>Nom:</strong> {suggestedDriver.name}</p>
                    <p><strong>Téléphone:</strong> {suggestedDriver.phone}</p>
                    <p><strong>Distance:</strong> {suggestedDriver.distance?.toFixed(2) || 'N/A'} km</p>
                    <p><strong>Statut:</strong> <span className={`status-badge status-${suggestedDriver.status}`}>
                      {translateStatus(suggestedDriver.status)}
                    </span></p>
                    <p><strong>Colis en cours:</strong> {suggestedDriver.assignedPackages || 0}</p>
                    <p><strong>Livrés aujourd'hui:</strong> {suggestedDriver.completedToday || 0}</p>
                  </div>
                </div>
              )}

              {selectedDriver && !suggestedDriver && (
                <div className="selected-driver">
                  <h4>✅ LIVREUR SÉLECTIONNÉ</h4>
                  <div className="driver-details">
                    <p><strong>Nom:</strong> {selectedDriver.name}</p>
                    <p><strong>Téléphone:</strong> {selectedDriver.phone}</p>
                    <p><strong>Statut:</strong> <span className={`status-badge status-${selectedDriver.status}`}>
                      {translateStatus(selectedDriver.status)}
                    </span></p>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn-success" disabled={!selectedDriver}>
              {selectedDriver ? '✅ Créer la livraison' : '⚠️ Choisir d\'abord un livreur'}
            </button>
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
