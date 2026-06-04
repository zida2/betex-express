import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import '../styles/PackagesPage.css';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suggestedDriver, setSuggestedDriver] = useState(null);
  const [findingDriver, setFindingDriver] = useState(false);
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
      const packagesRes = await api.get('/packages');
      setPackages(Array.isArray(packagesRes.data.data) ? packagesRes.data.data : []);
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
      setSuggestedDriver(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Impossible de trouver un livreur');
    } finally {
      setFindingDriver(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestedDriver) {
      alert('Veuillez d\'abord trouver un livreur disponible');
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
        driverId: suggestedDriver.id
      });
      
      alert('Livraison creee avec succes!');
      setShowForm(false);
      setSuggestedDriver(null);
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

            <button
              type="button"
              className="btn-secondary"
              onClick={findNearestDriver}
              disabled={findingDriver}
            >
              {findingDriver ? 'Recherche...' : 'Trouver livreur le plus proche'}
            </button>

            {suggestedDriver && (
              <div className="suggested-driver">
                <h4>LIVREUR SUGGERE</h4>
                <div className="driver-details">
                  <p><strong>Nom:</strong> {suggestedDriver.name}</p>
                  <p><strong>Telephone:</strong> {suggestedDriver.phone}</p>
                  <p><strong>Distance:</strong> {suggestedDriver.distance.toFixed(2)} km</p>
                  <p><strong>Taux de reussite:</strong> {suggestedDriver.successRate}%</p>
                  <p><strong>Statut:</strong> <span className={`status-badge status-${suggestedDriver.status}`}>{suggestedDriver.status}</span></p>
                  <p><strong>Livraisons totales:</strong> {suggestedDriver.totalDeliveries}</p>
                </div>
              </div>
            )}

            <button type="submit" className="btn-success" disabled={!suggestedDriver}>
              {suggestedDriver ? 'Creer la livraison' : 'Trouver d\'abord un livreur'}
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
                    {pkg.status}
                  </span>
                  <span className="package-type">{pkg.packageType}</span>
                </div>
                <div className="package-info">
                  <p><strong>De:</strong> {pkg.senderName} ({pkg.senderPhone})</p>
                  <p><strong>A:</strong> {pkg.customerName} ({pkg.customerPhone})</p>
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
