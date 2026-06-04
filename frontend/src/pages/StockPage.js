/**
 * Stock Management Page
 * Manage inventory by zone
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/StockPage.css';
import '../styles/StockPage.css';

const StockPage = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [stocks, setStocks] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    zoneId: '',
    quantity: 0,
    minimumQuantity: 10
  });
  const [updateForm, setUpdateForm] = useState({
    stockId: '',
    quantity: 0,
    type: 'in',
    reason: ''
  });

  // Fetch zones
  useEffect(() => {
    fetchZones();
    fetchLowStockAlerts();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      const data = response.data.data;
      const zonesList = Array.isArray(data) ? data : (data?.zones || []);
      setZones(zonesList);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setZones([]);
    }
  };

  const fetchStocks = async (zoneId) => {
    if (!zoneId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/stock/zone/${zoneId}`);
      const data = response.data.data;
      const stocksList = Array.isArray(data) ? data : (data?.stocks || []);
      setStocks(stocksList);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await api.get('/stock/alerts/low');
      const data = response.data.data;
      const alertsList = Array.isArray(data) ? data : (data?.alerts || []);
      setLowStockAlerts(alertsList);
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      setLowStockAlerts([]);
    }
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    fetchStocks(zoneId);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minimumQuantity' ? parseInt(value) : value
    }));
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value
    }));
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock', formData);
      alert('Stock créé avec succès');
      setShowForm(false);
      setFormData({ productId: '', zoneId: '', quantity: 0, minimumQuantity: 10 });
      if (selectedZone) fetchStocks(selectedZone);
    } catch (error) {
      console.error('Error creating stock:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/stock/${updateForm.stockId}`, {
        quantity: updateForm.quantity,
        type: updateForm.type,
        reason: updateForm.reason
      });
      alert('Stock mis à jour avec succès');
      setUpdateForm({ stockId: '', quantity: 0, type: 'in', reason: '' });
      if (selectedZone) fetchStocks(selectedZone);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-header">
        <h1>Gestion des Stocks</h1>
        <p>Gérez l'inventaire des produits par zone</p>
      </div>

      <div className="stock-container">
        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="alerts-section">
            <h2>⚠️ Alertes Stock Faible</h2>
            <div className="alerts-list">
              {lowStockAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-info">
                    <strong>{alert.Product?.name}</strong>
                    <p>Zone: {alert.Zone?.name}</p>
                    <p>Quantité: {alert.quantity} (Min: {alert.minimumQuantity})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone Selection */}
        <div className="zone-selection">
          <label htmlFor="zone-select">Sélectionner une zone:</label>
          <select 
            id="zone-select"
            value={selectedZone} 
            onChange={handleZoneChange}
            className="zone-select"
          >
            <option value="">-- Choisir une zone --</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        {/* Create Stock Button */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Ajouter Stock'}
          </button>
        </div>

        {/* Create Stock Form */}
        {showForm && (
          <div className="form-section">
            <h3>Créer un nouveau stock</h3>
            <form onSubmit={handleCreateStock} className="stock-form">
              <div className="form-group">
                <label>ID Produit:</label>
                <input
                  type="text"
                  name="productId"
                  value={formData.productId}
                  onChange={handleFormChange}
                  required
                  placeholder="UUID du produit"
                />
              </div>

              <div className="form-group">
                <label>Zone:</label>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- Choisir une zone --</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantité:</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Quantité Minimale:</label>
                <input
                  type="number"
                  name="minimumQuantity"
                  value={formData.minimumQuantity}
                  onChange={handleFormChange}
                  min="1"
                />
              </div>

              <button type="submit" className="btn btn-success">
                Créer Stock
              </button>
            </form>
          </div>
        )}

        {/* Stocks List */}
        {selectedZone && (
          <div className="stocks-section">
            <h2>Stocks de la zone</h2>
            {loading ? (
              <p>Chargement...</p>
            ) : stocks.length > 0 ? (
              <div className="stocks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>SKU</th>
                      <th>Quantité</th>
                      <th>Min</th>
                      <th>Prix</th>
                      <th>Catégorie</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(stock => (
                      <tr key={stock.id} className={stock.quantity <= stock.minimumQuantity ? 'low-stock' : ''}>
                        <td>{stock.Product?.name}</td>
                        <td>{stock.Product?.sku}</td>
                        <td className="quantity">{stock.quantity}</td>
                        <td>{stock.minimumQuantity}</td>
                        <td>${stock.Product?.price}</td>
                        <td>{stock.Product?.category}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => {
                              setUpdateForm({
                                stockId: stock.id,
                                quantity: stock.quantity,
                                type: 'in',
                                reason: ''
                              });
                            }}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Aucun stock pour cette zone</p>
            )}
          </div>
        )}

        {/* Update Stock Form */}
        {updateForm.stockId && (
          <div className="form-section">
            <h3>Mettre à jour le stock</h3>
            <form onSubmit={handleUpdateStock} className="stock-form">
              <div className="form-group">
                <label>Type de mouvement:</label>
                <select
                  name="type"
                  value={updateForm.type}
                  onChange={handleUpdateFormChange}
                >
                  <option value="in">Entrée</option>
                  <option value="out">Sortie</option>
                  <option value="adjustment">Ajustement</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantité:</label>
                <input
                  type="number"
                  name="quantity"
                  value={updateForm.quantity}
                  onChange={handleUpdateFormChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Raison:</label>
                <input
                  type="text"
                  name="reason"
                  value={updateForm.reason}
                  onChange={handleUpdateFormChange}
                  placeholder="Raison du mouvement"
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-success">
                  Mettre à jour
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setUpdateForm({ stockId: '', quantity: 0, type: 'in', reason: '' })}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
