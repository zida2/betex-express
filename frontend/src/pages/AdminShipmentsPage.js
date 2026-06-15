/**
 * Admin Shipments Management Page
 * Manage all shipments - pricing, status updates, tracking
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/AdminShipmentsPage.css';

const AdminShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingData, setPricingData] = useState({
    shippingAmount: '',
    additionalFees: 0,
    adminNotes: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shipments');
      setShipments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load shipments:', error);
      setMessage('❌ Erreur lors du chargement des expéditions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPricing = (shipment) => {
    setSelectedShipment(shipment);
    setPricingData({
      shippingAmount: shipment.shippingAmount || '',
      additionalFees: shipment.additionalFees || 0,
      adminNotes: shipment.adminNotes || ''
    });
    setShowPricingModal(true);
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setPricingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPricing = async () => {
    if (!pricingData.shippingAmount || parseFloat(pricingData.shippingAmount) <= 0) {
      setMessage('❌ Le montant d\'expédition doit être supérieur à 0');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/shipments/${selectedShipment.id}/pricing`, {
        shippingAmount: parseFloat(pricingData.shippingAmount),
        additionalFees: parseFloat(pricingData.additionalFees || 0),
        adminNotes: pricingData.adminNotes
      });

      setMessage('✅ Tarification enregistrée avec succès !');
      setShowPricingModal(false);
      setSelectedShipment(null);
      setPricingData({ shippingAmount: '', additionalFees: 0, adminNotes: '' });
      
      // Reload shipments
      await loadShipments();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to set pricing:', error);
      setMessage('❌ Erreur lors de la tarification');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      await api.put(`/shipments/${shipmentId}/status`, {
        status: newStatus
      });
      setMessage('✅ Statut mis à jour');
      await loadShipments();
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Failed to update status:', error);
      setMessage('❌ Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_pricing: { label: '⏳ En attente de tarification', class: 'pending' },
      awaiting_payment: { label: '💳 En attente de paiement', class: 'awaiting' },
      paid: { label: '✅ Payé', class: 'paid' },
      processing: { label: '📦 En traitement', class: 'processing' },
      in_transit: { label: '🚚 En transit', class: 'transit' },
      delivered: { label: '✔️ Livré', class: 'delivered' },
      cancelled: { label: '❌ Annulé', class: 'cancelled' }
    };
    return statusMap[status] || { label: status, class: 'default' };
  };

  const filteredShipments = shipments.filter(shipment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return shipment.status === 'pending_pricing';
    if (filter === 'awaiting') return shipment.status === 'awaiting_payment';
    if (filter === 'active') return shipment.status === 'processing' || shipment.status === 'in_transit';
    if (filter === 'completed') return shipment.status === 'delivered';
    return true;
  });

  const pendingCount = shipments.filter(s => s.status === 'pending_pricing').length;
  const awaitingCount = shipments.filter(s => s.status === 'awaiting_payment').length;

  return (
    <div className="admin-shipments-page">
      <header className="page-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
            ← Retour au Dashboard
          </button>
          <div className="header-title">
            <h1>📮 Gestion des Expéditions</h1>
            <p>Gérez les demandes d'expédition, fixez les tarifs et suivez les envois</p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="alert-banner">
            🔔 {pendingCount} nouvelle(s) demande(s) en attente de tarification
          </div>
        )}
      </header>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="page-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({shipments.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ À tarifer ({pendingCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'awaiting' ? 'active' : ''}`}
          onClick={() => setFilter('awaiting')}
        >
          💳 En attente paiement ({awaitingCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Actives ({shipments.filter(s => s.status === 'processing' || s.status === 'in_transit').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Livrées ({shipments.filter(s => s.status === 'delivered').length})
        </button>
      </div>

      <main className="page-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des expéditions...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📮</div>
            <h3>Aucune expédition</h3>
            <p>Aucune expédition ne correspond à ce filtre</p>
          </div>
        ) : (
          <div className="shipments-grid">
            {filteredShipments.map(shipment => {
              const statusInfo = getStatusBadge(shipment.status);
              const totalAmount = (parseFloat(shipment.shippingAmount || 0) + parseFloat(shipment.additionalFees || 0)).toFixed(2);
              
              return (
                <div key={shipment.id} className="shipment-card">
                  {/* Header */}
                  <div className="shipment-header">
                    <div className="tracking-info">
                      <span className="tracking-label">N° Suivi</span>
                      <span className="tracking-number">{shipment.trackingNumber}</span>
                    </div>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="shipment-section">
                    <h4>👤 Client</h4>
                    <p className="client-name">{shipment.Client?.firstName} {shipment.Client?.lastName}</p>
                    <p className="client-email">{shipment.Client?.email}</p>
                  </div>

                  {/* Recipient Info */}
                  <div className="shipment-section">
                    <h4>📥 Destinataire</h4>
                    <div className="info-row">
                      <strong>{shipment.recipientName}</strong>
                      <span className="phone">{shipment.recipientPhone}</span>
                    </div>
                    <p className="address">{shipment.destinationAddress}</p>
                  </div>

                  {/* Package Info */}
                  <div className="shipment-section">
                    <h4>📦 Colis</h4>
                    <p className="description">{shipment.packageDescription}</p>
                    <div className="info-grid">
                      {shipment.weight && (
                        <div className="info-item">
                          <span className="label">Poids:</span>
                          <span className="value">{shipment.weight} kg</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Valeur:</span>
                        <span className="value">{shipment.packageValue?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  {(shipment.shippingAmount > 0 || shipment.status === 'pending_pricing') && (
                    <div className={`shipment-section pricing-section ${shipment.status === 'pending_pricing' ? 'pending' : ''}`}>
                      <h4>💰 Tarification</h4>
                      {shipment.shippingAmount > 0 ? (
                        <>
                          <div className="pricing-details">
                            <div className="pricing-row">
                              <span>Frais d'expédition:</span>
                              <span className="amount">{parseFloat(shipment.shippingAmount).toLocaleString()} FCFA</span>
                            </div>
                            {shipment.additionalFees > 0 && (
                              <div className="pricing-row">
                                <span>Frais supplémentaires:</span>
                                <span className="amount">{parseFloat(shipment.additionalFees).toLocaleString()} FCFA</span>
                              </div>
                            )}
                            <div className="pricing-row total">
                              <span>Total:</span>
                              <span className="amount">{parseFloat(totalAmount).toLocaleString()} FCFA</span>
                            </div>
                          </div>
                          <button 
                            className="btn-secondary"
                            onClick={() => handleOpenPricing(shipment)}
                          >
                            ✏️ Modifier le tarif
                          </button>
                        </>
                      ) : (
                        <button 
                          className="btn-primary"
                          onClick={() => handleOpenPricing(shipment)}
                        >
                          💰 Fixer le tarif
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status Actions */}
                  {shipment.status === 'paid' && (
                    <div className="action-section">
                      <button 
                        className="btn-action"
                        onClick={() => handleUpdateStatus(shipment.id, 'processing')}
                      >
                        📦 Mettre en traitement
                      </button>
                    </div>
                  )}

                  {shipment.status === 'processing' && (
                    <div className="action-section">
                      <button 
                        className="btn-action"
                        onClick={() => handleUpdateStatus(shipment.id, 'in_transit')}
                      >
                        🚚 Mettre en transit
                      </button>
                    </div>
                  )}

                  {shipment.status === 'in_transit' && (
                    <div className="action-section">
                      <button 
                        className="btn-action success"
                        onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
                      >
                        ✅ Marquer comme livré
                      </button>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {shipment.adminNotes && (
                    <div className="admin-notes">
                      <strong>📝 Vos notes:</strong> {shipment.adminNotes}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="shipment-footer">
                    <span className="date">
                      Créé le {new Date(shipment.createdAt).toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Pricing Modal */}
      {showPricingModal && selectedShipment && (
        <div className="modal-overlay" onClick={() => setShowPricingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Tarification de l'expédition</h2>
              <button className="btn-close" onClick={() => setShowPricingModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="shipment-summary">
                <h3>Résumé de l'expédition</h3>
                <p><strong>N° Suivi:</strong> {selectedShipment.trackingNumber}</p>
                <p><strong>Destinataire:</strong> {selectedShipment.recipientName}</p>
                <p><strong>Destination:</strong> {selectedShipment.destinationAddress}</p>
                <p><strong>Poids:</strong> {selectedShipment.weight || 'Non spécifié'} kg</p>
                <p><strong>Valeur du colis:</strong> {selectedShipment.packageValue?.toLocaleString()} FCFA</p>
              </div>

              <form className="pricing-form">
                <div className="form-group">
                  <label>Montant d'expédition (FCFA) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="shippingAmount"
                    value={pricingData.shippingAmount}
                    onChange={handlePricingChange}
                    placeholder="Ex: 15000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Frais supplémentaires (FCFA)</label>
                  <input
                    type="number"
                    name="additionalFees"
                    value={pricingData.additionalFees}
                    onChange={handlePricingChange}
                    placeholder="Ex: 2000"
                  />
                </div>

                <div className="form-group">
                  <label>Notes pour le client</label>
                  <textarea
                    name="adminNotes"
                    value={pricingData.adminNotes}
                    onChange={handlePricingChange}
                    placeholder="Ex: Livraison express incluse, assurance comprise..."
                    rows="3"
                  />
                </div>

                <div className="total-display">
                  <strong>Total à payer par le client:</strong>
                  <span className="total-amount">
                    {(parseFloat(pricingData.shippingAmount || 0) + parseFloat(pricingData.additionalFees || 0)).toLocaleString()} FCFA
                  </span>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPricingModal(false)}>
                Annuler
              </button>
              <button 
                className="btn-submit" 
                onClick={handleSubmitPricing}
                disabled={!pricingData.shippingAmount || parseFloat(pricingData.shippingAmount) <= 0}
              >
                💾 Enregistrer et notifier le client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipmentsPage;
