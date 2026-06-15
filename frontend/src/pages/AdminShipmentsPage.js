/**
 * Admin Shipments Management Page
 * Manage all shipments - pricing, status updates, tracking
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPackages, updatePackage } from '../services/firebaseService';
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
      const allPackages = await getPackages();
      // Filter shipments (type: 'shipment')
      setShipments(allPackages.filter(pkg => pkg.type === 'shipment' || !pkg.type) || []);
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
      shippingAmount: shipment.deliveryPrice || '',
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
      await updatePackage(selectedShipment.id, {
        deliveryPrice: parseFloat(pricingData.shippingAmount),
        additionalFees: parseFloat(pricingData.additionalFees || 0),
        adminNotes: pricingData.adminNotes,
        status: 'awaiting_payment' // Or whatever status makes sense after pricing
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
      await updatePackage(shipmentId, {
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
      in_delivery: { label: '🚚 En livraison', class: 'transit' },
      delivered: { label: '✔️ Livré', class: 'delivered' },
      cancelled: { label: '❌ Annulé', class: 'cancelled' }
    };
    return statusMap[status] || { label: status, class: 'default' };
  };

  const filteredShipments = shipments.filter(shipment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return shipment.status === 'pending_pricing' || shipment.status === 'pending';
    if (filter === 'awaiting') return shipment.status === 'awaiting_payment';
    if (filter === 'active') return shipment.status === 'processing' || shipment.status === 'in_transit' || shipment.status === 'in_delivery';
    if (filter === 'completed') return shipment.status === 'delivered';
    return true;
  });

  const pendingCount = shipments.filter(s => s.status === 'pending_pricing' || s.status === 'pending').length;
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
          Actives ({shipments.filter(s => s.status === 'processing' || s.status === 'in_transit' || s.status === 'in_delivery').length})
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
              const totalAmount = (parseFloat(shipment.deliveryPrice || 0) + parseFloat(shipment.additionalFees || 0)).toFixed(2);
              
              return (
                <div key={shipment.id} className="shipment-card">
                  {/* Header */}
                  <div className="shipment-header">
                    <div className="tracking-info">
                      <span className="tracking-label">N° Suivi</span>
                      <span className="tracking-number">{shipment.id?.substring(0, 8) || 'N/A'}</span>
                    </div>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="shipment-section">
                    <h4>👤 Client</h4>
                    <p className="client-name">{shipment.senderName || shipment.customerName || 'N/A'}</p>
                    <p className="client-email">{shipment.senderPhone || shipment.customerPhone || 'N/A'}</p>
                  </div>

                  {/* Recipient Info */}
                  <div className="shipment-section">
                    <h4>📥 Destinataire</h4>
                    <div className="info-row">
                      <strong>{shipment.receiverName || shipment.recipientName || 'N/A'}</strong>
                      <span className="phone">{shipment.receiverPhone || shipment.recipientPhone || 'N/A'}</span>
                    </div>
                    <p className="address">{shipment.receiverAddress || shipment.destinationAddress || shipment.address || 'N/A'}</p>
                  </div>

                  {/* Package Info */}
                  <div className="shipment-section">
                    <h4>📦 Colis</h4>
                    <p className="description">{shipment.description || shipment.packageDescription || 'Aucune description'}</p>
                    <div className="info-grid">
                      {shipment.weight && (
                        <div className="info-item">
                          <span className="label">Poids:</span>
                          <span className="value">{shipment.weight} kg</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">Valeur:</span>
                        <span className="value">{parseFloat(shipment.packagePrice || shipment.packageValue || 0).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  {shipment.deliveryPrice > 0 || shipment.status === 'pending' || shipment.status === 'pending_pricing' ? (
                    <div className={`shipment-section pricing-section ${(shipment.status === 'pending_pricing' || shipment.status === 'pending') ? 'pending' : ''}`}>
                      <h4>💰 Tarification</h4>
                      {shipment.deliveryPrice > 0 ? (
                        <>
                          <div className="pricing-details">
                            <div className="pricing-row">
                              <span>Frais d'expédition:</span>
                              <span className="amount">{parseFloat(shipment.deliveryPrice).toLocaleString()} FCFA</span>
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
                  ) : null}

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

                  {shipment.status === 'in_transit' || shipment.status === 'in_delivery' ? (
                    <div className="action-section">
                      <button 
                        className="btn-action success"
                        onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
                      >
                        ✅ Marquer comme livré
                      </button>
                    </div>
                  ) : null}

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
                <p><strong>N° Suivi:</strong> {selectedShipment.id?.substring(0, 8) || 'N/A'}</p>
                <p><strong>Destinataire:</strong> {selectedShipment.receiverName || selectedShipment.recipientName || 'N/A'}</p>
                <p><strong>Destination:</strong> {selectedShipment.receiverAddress || selectedShipment.destinationAddress || selectedShipment.address || 'N/A'}</p>
                <p><strong>Poids:</strong> {selectedShipment.weight || 'Non spécifié'} kg</p>
                <p><strong>Valeur du colis:</strong> {parseFloat(selectedShipment.packagePrice || selectedShipment.packageValue || 0).toLocaleString()} FCFA</p>
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
