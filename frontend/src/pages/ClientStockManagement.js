/**
 * Client Stock Management Page (Admin)
 * Manage inventory by client with daily updates
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ClientStockManagement.css';

const ClientStockManagement = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [message, setMessage] = useState('');
  
  const [newStock, setNewStock] = useState({
    productId: '',
    quantity: '',
    notes: ''
  });

  const [newMovement, setNewMovement] = useState({
    type: 'entry',
    quantity: '',
    reason: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientStocks();
      loadClientMovements();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const response = await api.get('/auth/users?role=client');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setMessage('❌ Erreur lors du chargement des clients');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/stock/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadClientStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/client-stock?clientId=${selectedClient.id}`);
      setStocks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load stocks:', error);
      setMessage('❌ Erreur lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  };

  const loadClientMovements = async () => {
    try {
      const response = await api.get(`/client-stock/history/${selectedClient.id}`);
      setMovements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load movements:', error);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.productId || !newStock.quantity || parseFloat(newStock.quantity) <= 0) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await api.post('/client-stock', {
        clientId: selectedClient.id,
        productId: newStock.productId,
        quantity: parseFloat(newStock.quantity),
        notes: newStock.notes
      });

      setMessage('✅ Produit ajouté au stock du client');
      setShowAddStockModal(false);
      setNewStock({ productId: '', quantity: '', notes: '' });
      await loadClientStocks();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add stock:', error);
      setMessage('❌ Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMovement = async () => {
    if (!newMovement.quantity || parseFloat(newMovement.quantity) <= 0 || !newMovement.reason) {
      setMessage('❌ Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/client-stock/${selectedStock.id}/movement`, {
        type: newMovement.type,
        quantity: parseFloat(newMovement.quantity),
        reason: newMovement.reason
      });

      const movementType = newMovement.type === 'entry' ? 'Entrée' : 'Sortie';
      setMessage(`✅ ${movementType} enregistrée avec succès`);
      setShowMovementModal(false);
      setSelectedStock(null);
      setNewMovement({ type: 'entry', quantity: '', reason: '' });
      await loadClientStocks();
      await loadClientMovements();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to record movement:', error);
      setMessage('❌ Erreur lors de l\'enregistrement du mouvement');
    } finally {
      setLoading(false);
    }
  };

  const getTodayMovements = () => {
    const today = new Date().toDateString();
    return movements.filter(m => new Date(m.createdAt).toDateString() === today);
  };

  return (
    <div className="client-stock-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour au Dashboard
        </button>
        <div className="header-title">
          <h1>📦 Gestion des Stocks Clients</h1>
          <p>Gérez l'inventaire de chaque client avec actualisation quotidienne</p>
        </div>
      </header>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="content-wrapper">
        {/* Client Selection Sidebar */}
        <aside className="clients-sidebar">
          <h3>👥 Clients ({clients.length})</h3>
          <div className="clients-list">
            {clients.map(client => (
              <div
                key={client.id}
                className={`client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="client-avatar">{client.firstName?.[0]}{client.lastName?.[0]}</div>
                <div className="client-info">
                  <strong>{client.firstName} {client.lastName}</strong>
                  <span className="client-email">{client.email}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {!selectedClient ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h3>Sélectionnez un client</h3>
              <p>Choisissez un client dans la liste pour voir et gérer son stock</p>
            </div>
          ) : (
            <>
              {/* Client Stock Header */}
              <div className="stock-header">
                <div className="client-details">
                  <h2>Stock de {selectedClient.firstName} {selectedClient.lastName}</h2>
                  <p>{selectedClient.email} • {selectedClient.phone}</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddStockModal(true)}>
                  ➕ Ajouter un produit
                </button>
              </div>

              {/* Today's Summary */}
              <div className="daily-summary">
                <h3>📅 Mise à jour du jour ({new Date().toLocaleDateString('fr-FR')})</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-icon">📦</div>
                    <div className="summary-info">
                      <span className="summary-label">Produits en stock</span>
                      <span className="summary-value">{stocks.length}</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">📥</div>
                    <div className="summary-info">
                      <span className="summary-label">Entrées aujourd'hui</span>
                      <span className="summary-value">
                        {getTodayMovements().filter(m => m.type === 'entry').length}
                      </span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">📤</div>
                    <div className="summary-info">
                      <span className="summary-label">Sorties aujourd'hui</span>
                      <span className="summary-value">
                        {getTodayMovements().filter(m => m.type === 'exit').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Table */}
              <div className="stock-section">
                <h3>📊 Inventaire actuel</h3>
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement...</p>
                  </div>
                ) : stocks.length === 0 ? (
                  <div className="empty-state-small">
                    <p>Aucun produit en stock</p>
                    <button className="btn-secondary" onClick={() => setShowAddStockModal(true)}>
                      Ajouter le premier produit
                    </button>
                  </div>
                ) : (
                  <div className="stock-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Quantité</th>
                          <th>Dernière mise à jour</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocks.map(stock => (
                          <tr key={stock.id}>
                            <td>
                              <strong>{stock.Product?.name || 'Produit inconnu'}</strong>
                              {stock.notes && <p className="stock-notes">{stock.notes}</p>}
                            </td>
                            <td>
                              <span className={`quantity-badge ${stock.quantity <= 10 ? 'low' : ''}`}>
                                {stock.quantity} {stock.Product?.unit || 'unités'}
                              </span>
                            </td>
                            <td>{new Date(stock.updatedAt).toLocaleString('fr-FR')}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn-action entry"
                                  onClick={() => {
                                    setSelectedStock(stock);
                                    setNewMovement({ type: 'entry', quantity: '', reason: '' });
                                    setShowMovementModal(true);
                                  }}
                                >
                                  📥 Entrée
                                </button>
                                <button
                                  className="btn-action exit"
                                  onClick={() => {
                                    setSelectedStock(stock);
                                    setNewMovement({ type: 'exit', quantity: '', reason: '' });
                                    setShowMovementModal(true);
                                  }}
                                >
                                  📤 Sortie
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Movement History */}
              <div className="movements-section">
                <h3>📋 Historique des mouvements (30 derniers jours)</h3>
                {movements.length === 0 ? (
                  <p className="no-data">Aucun mouvement enregistré</p>
                ) : (
                  <div className="movements-list">
                    {movements.slice(0, 20).map(movement => (
                      <div key={movement.id} className={`movement-item ${movement.type}`}>
                        <div className="movement-icon">
                          {movement.type === 'entry' ? '📥' : '📤'}
                        </div>
                        <div className="movement-info">
                          <strong>{movement.Stock?.Product?.name || 'Produit'}</strong>
                          <p className="movement-reason">{movement.reason}</p>
                          <span className="movement-date">
                            {new Date(movement.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="movement-quantity">
                          {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="modal-overlay" onClick={() => setShowAddStockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Ajouter un produit au stock</h2>
              <button className="btn-close" onClick={() => setShowAddStockModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Produit <span className="required">*</span></label>
                <select
                  value={newStock.productId}
                  onChange={(e) => setNewStock({ ...newStock, productId: e.target.value })}
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantité initiale <span className="required">*</span></label>
                <input
                  type="number"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newStock.notes}
                  onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })}
                  placeholder="Notes optionnelles..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddStockModal(false)}>
                Annuler
              </button>
              <button className="btn-submit" onClick={handleAddStock}>
                ➕ Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Movement Modal */}
      {showMovementModal && selectedStock && (
        <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {newMovement.type === 'entry' ? '📥 Enregistrer une entrée' : '📤 Enregistrer une sortie'}
              </h2>
              <button className="btn-close" onClick={() => setShowMovementModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="stock-info">
                <p><strong>Produit:</strong> {selectedStock.Product?.name}</p>
                <p><strong>Stock actuel:</strong> {selectedStock.quantity} {selectedStock.Product?.unit}</p>
              </div>
              <div className="form-group">
                <label>Type de mouvement</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="entry"
                      checked={newMovement.type === 'entry'}
                      onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
                    />
                    <span>📥 Entrée (Ajout)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="exit"
                      checked={newMovement.type === 'exit'}
                      onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
                    />
                    <span>📤 Sortie (Retrait)</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Quantité <span className="required">*</span></label>
                <input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                  placeholder="Ex: 50"
                />
              </div>
              <div className="form-group">
                <label>Raison <span className="required">*</span></label>
                <textarea
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                  placeholder="Ex: Réapprovisionnement, Livraison client, Inventaire..."
                  rows="3"
                />
              </div>
              {newMovement.type === 'exit' && parseFloat(newMovement.quantity) > selectedStock.quantity && (
                <div className="warning-message">
                  ⚠️ Attention: La quantité de sortie dépasse le stock disponible
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowMovementModal(false)}>
                Annuler
              </button>
              <button className="btn-submit" onClick={handleRecordMovement}>
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientStockManagement;
