import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/StockPage.css';
import '../styles/PageLayout.css';

const StockPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [clientStockForm, setClientStockForm] = useState({
    productId: '',
    quantity: '',
    notes: ''
  });

  const [movementForm, setMovementForm] = useState({
    type: 'in',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/auth/clients-with-activity');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/stock/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchClientStocks = async (clientId) => {
    setLoading(true);
    try {
      const response = await api.get('/client-stock', {
        params: { clientId }
      });
      setStocks(response.data.data);
      
      setMessage('');
    } catch (error) {
      console.error('Error fetching client stocks:', error);
      setMessage('❌ Erreur lors du chargement des stocks client');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (client) => {
    setSelectedClient(client);
    fetchClientStocks(client.id);
  };

  const handleAddClientStock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/client-stock', {
        ...clientStockForm,
        clientId: selectedClient.id,
        quantity: parseInt(clientStockForm.quantity)
      });
      setMessage('✅ Produit ajouté au stock client avec succès');
      setShowForm(false);
      setClientStockForm({ productId: '', quantity: '', notes: '' });
      fetchClientStocks(selectedClient.id);
    } catch (error) {
      console.error('Error adding client stock:', error);
      setMessage('❌ Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/client-stock/movement', {
        stockId: selectedStock.id,
        type: movementForm.type,
        quantity: parseInt(movementForm.quantity),
        reason: movementForm.reason
      });
      setMessage('✅ Mouvement enregistré avec succès');
      setShowMovementModal(false);
      setMovementForm({ type: 'in', quantity: '', reason: '' });
      fetchClientStocks(selectedClient.id);
    } catch (error) {
      console.error('Error recording movement:', error);
      setMessage('❌ Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="page-layout stock-page">
      <div className="page-header stock-header">
        <h1>📦 Gestion des Stocks</h1>
        <p>Gérez l'inventaire des clients</p>
      </div>

      <div className="page-content stock-container">
        {message && (
          <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="mode-selection">
          <div className="mode-selector">
            <h3>Mode: Par Client</h3>
          </div>
        </div>

        <div className="client-mode">
          <div className="content-wrapper">
            <aside className="clients-sidebar">
              <h3>👥 Clients</h3>
              <div className="clients-list">
                {clients.map(client => (
                  <div
                    key={client.id}
                    className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                    onClick={() => handleClientChange(client)}
                  >
                    <div className="client-info">
                      <strong>{client.firstName} {client.lastName}</strong>
                      <span>{client.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="main-content">
              {!selectedClient ? (
                <div className="empty-state">
                  <div className="empty-icon">👈</div>
                  <h3>Sélectionnez un client</h3>
                  <p>Choisissez un client pour gérer son stock</p>
                </div>
              ) : (
                <>
                  <div className="client-header">
                    <h2>📦 Stock de {selectedClient.firstName} {selectedClient.lastName}</h2>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                      ➕ Ajouter un produit
                    </button>
                  </div>

                  <div className="stock-section">
                    <h3>📊 Inventaire</h3>
                    {loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement...</p>
                      </div>
                    ) : stocks.length === 0 ? (
                      <div className="empty-state-small">
                        <p>Aucun produit en stock</p>
                        <button className="btn-secondary" onClick={() => setShowForm(true)}>
                          Ajouter le premier produit
                        </button>
                      </div>
                    ) : (
                      <div className="stocks-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Produit</th>
                              <th>Quantité</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stocks.map(stock => (
                              <tr key={stock.id}>
                                <td>{stock.Product?.name}</td>
                                <td>{stock.quantity}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => {
                                      setSelectedStock(stock);
                                      setShowMovementModal(true);
                                    }}
                                  >
                                    Mouvement
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>

        {showForm && selectedClient && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Ajouter un produit</h2>
                <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddClientStock}>
                  <div className="form-group">
                    <label>Produit *</label>
                    <select
                      value={clientStockForm.productId}
                      onChange={(e) => setClientStockForm({ ...clientStockForm, productId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantité initiale *</label>
                    <input
                      type="number"
                      value={clientStockForm.quantity}
                      onChange={(e) => setClientStockForm({ ...clientStockForm, quantity: e.target.value })}
                      placeholder="Ex: 100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={clientStockForm.notes}
                      onChange={(e) => setClientStockForm({ ...clientStockForm, notes: e.target.value })}
                      placeholder="Notes optionnelles..."
                      rows="3"
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-submit">
                      ➕ Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showMovementModal && selectedStock && (
          <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {movementForm.type === 'in' ? '📥 Entrée' : '📤 Sortie'}
                </h2>
                <button className="btn-close" onClick={() => setShowMovementModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRecordMovement}>
                  <div className="stock-info">
                    <p><strong>Produit:</strong> {selectedStock.Product?.name}</p>
                    <p><strong>Stock actuel:</strong> {selectedStock.quantity}</p>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="in"
                          checked={movementForm.type === 'in'}
                          onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                        />
                        📥 Entrée
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          value="out"
                          checked={movementForm.type === 'out'}
                          onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                        />
                        📤 Sortie
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Quantité *</label>
                    <input
                      type="number"
                      value={movementForm.quantity}
                      onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                      placeholder="Ex: 50"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Raison *</label>
                    <textarea
                      value={movementForm.reason}
                      onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                      placeholder="Ex: Réapprovisionnement, Livraison..."
                      rows="3"
                      required
                    />
                  </div>
                  {movementForm.type === 'out' && parseFloat(movementForm.quantity) > selectedStock.quantity && (
                    <div className="warning-message">
                      ⚠️ La quantité demandée dépasse le stock disponible
                    </div>
                  )}
                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={() => setShowMovementModal(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-submit">
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
