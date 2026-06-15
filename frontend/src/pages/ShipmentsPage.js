/**
 * Shipments Page - Client View
 * Shows all shipments created by the client
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/ShipmentsPage.css';

const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
    } finally {
      setLoading(false);
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

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusMap = {
      unpaid: { label: '⏳ Non payé', class: 'unpaid' },
      paid: { label: '✅ Payé', class: 'paid' },
      refunded: { label: '↩️ Remboursé', class: 'refunded' }
    };
    return statusMap[paymentStatus] || { label: paymentStatus, class: 'default' };
  };

  const filteredShipments = shipments.filter(shipment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return shipment.status === 'pending_pricing' || shipment.status === 'awaiting_payment';
    if (filter === 'active') return shipment.status === 'processing' || shipment.status === 'in_transit';
    if (filter === 'completed') return shipment.status === 'delivered';
    return true;
  });

  return (
    <div className="shipments-page">
      <header className="page-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/client')}>
            ← Retour
          </button>
          <div className="header-title">
            <h1>📮 Mes Expéditions</h1>
            <p>Suivez vos envois nationaux et internationaux</p>
          </div>
        </div>
      </header>

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
          En attente ({shipments.filter(s => s.status === 'pending_pricing' || s.status === 'awaiting_payment').length})
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
            <p>Vous n'avez pas encore créé d'expédition</p>
            <button className="btn-primary" onClick={() => navigate('/client')}>
              Créer une expédition
            </button>
          </div>
        ) : (
          <div className="shipments-grid">
            {filteredShipments.map(shipment => {
              const statusInfo = getStatusBadge(shipment.status);
              const paymentInfo = getPaymentStatusBadge(shipment.paymentStatus);
              
              return (
                <div key={shipment.id} className="shipment-card">
                  {/* Header */}
                  <div className="shipment-header">
                    <div className="tracking-info">
                      <span className="tracking-label">N° Suivi:</span>
                      <span className="tracking-number">{shipment.trackingNumber}</span>
                    </div>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
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

                  {/* Pricing Info */}
                  {(shipment.shippingAmount > 0 || shipment.totalAmount > 0) && (
                    <div className="shipment-section pricing-section">
                      <h4>💰 Tarification</h4>
                      <div className="pricing-details">
                        {shipment.shippingAmount > 0 && (
                          <div className="pricing-row">
                            <span>Frais d'expédition:</span>
                            <span className="amount">{shipment.shippingAmount?.toLocaleString()} FCFA</span>
                          </div>
                        )}
                        {shipment.additionalFees > 0 && (
                          <div className="pricing-row">
                            <span>Frais supplémentaires:</span>
                            <span className="amount">{shipment.additionalFees?.toLocaleString()} FCFA</span>
                          </div>
                        )}
                        {shipment.totalAmount > 0 && (
                          <div className="pricing-row total">
                            <span>Total:</span>
                            <span className="amount">{shipment.totalAmount?.toLocaleString()} FCFA</span>
                          </div>
                        )}
                      </div>
                      <div className={`payment-badge ${paymentInfo.class}`}>
                        {paymentInfo.label}
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {shipment.status === 'pending_pricing' && (
                    <div className="status-message pending">
                      ⏳ En attente de tarification par l'administrateur
                    </div>
                  )}
                  
                  {shipment.status === 'awaiting_payment' && (
                    <div className="status-message awaiting">
                      💳 Veuillez procéder au paiement pour que votre colis soit expédié
                    </div>
                  )}

                  {shipment.status === 'in_transit' && (
                    <div className="status-message transit">
                      🚚 Votre colis est en cours d'acheminement
                    </div>
                  )}

                  {shipment.status === 'delivered' && shipment.deliveredAt && (
                    <div className="status-message delivered">
                      ✔️ Livré le {new Date(shipment.deliveredAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}

                  {/* Admin Notes */}
                  {shipment.adminNotes && (
                    <div className="admin-notes">
                      <strong>📝 Note de l'admin:</strong> {shipment.adminNotes}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="shipment-footer">
                    <span className="date">
                      Créé le {new Date(shipment.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShipmentsPage;
