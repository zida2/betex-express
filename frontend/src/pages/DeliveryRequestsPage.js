/**
 * Delivery Requests Management Page
 * Admin can view and approve delivery requests from clients
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/DeliveryRequestsPage.css';

const DeliveryRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_approval');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-requests');
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  // Generate WhatsApp link with auto-geolocation
  const generateWhatsAppLink = (request) => {
    const message = `Bonjour ${request.receiverName},\n\nVotre livraison BETEX EXPRESS est en cours!\n\n📍 Cliquez ici pour partager votre localisation:\n${window.location.origin}/delivery-location/${request.id}\n\nLivreur: ${request.driverName || 'À assigner'}\nTéléphone: ${request.driverPhone || 'Non assigné'}\n\nMerci!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${request.receiverPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    return whatsappUrl;
  };

  const handleApprove = async (requestId) => {
    try {
      // In demo mode, just update locally
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      ));
      setMessage('✅ Demande approuvée!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'approbation');
      console.error('Error:', error);
    }
  };

  const handleReject = async (requestId, reason) => {
    const rejectReason = prompt('Raison du rejet:');
    if (!rejectReason) return;

    try {
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected', rejectReason }
          : req
      ));
      setMessage('❌ Demande rejetée');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors du rejet');
      console.error('Error:', error);
    }
  };

  return (
    <div className="delivery-requests-page">
      <header className="requests-header">
        <h1>📋 Gestion des Demandes de Livraison Client</h1>
        <p>Approuvez ou rejetez les demandes, générez les liens WhatsApp</p>
      </header>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'pending_approval' ? 'active' : ''}`}
          onClick={() => setFilter('pending_approval')}
        >
          ⏳ En attente ({requests.filter(r => r.status === 'pending_approval').length})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          ✅ Approuvées ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          ❌ Rejetées ({requests.filter(r => r.status === 'rejected').length})
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          📊 Toutes ({requests.length})
        </button>
      </div>

      <main className="requests-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="no-data">
            Aucune demande pour ce filtre
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map(request => (
              <div key={request.id} className={`request-item status-${request.status}`}>
                <div className="request-top">
                  <div className="request-id">
                    <strong>#{request.id}</strong>
                    <span className={`status-label status-${request.status}`}>
                      {request.status === 'pending_approval' && '⏳ En attente'}
                      {request.status === 'approved' && '✅ Approuvée'}
                      {request.status === 'rejected' && '❌ Rejetée'}
                    </span>
                  </div>
                  <div className="request-date">
                    {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="request-main">
                  {/* Sender Info */}
                  <div className="info-section">
                    <h4>📤 Expéditeur</h4>
                    <p><strong>{request.senderName}</strong></p>
                    <p>☎️ {request.senderPhone}</p>
                    {request.senderAddress && <p>📍 {request.senderAddress}</p>}
                  </div>

                  {/* Receiver Info */}
                  <div className="info-section">
                    <h4>📥 Destinataire</h4>
                    <p><strong>{request.receiverName}</strong></p>
                    <p>☎️ {request.receiverPhone}</p>
                    {request.receiverAddress && <p>📍 {request.receiverAddress}</p>}
                  </div>

                  {/* Package Info */}
                  <div className="info-section">
                    <h4>📦 Colis</h4>
                    {request.description && <p>{request.description}</p>}
                    {request.weight && <p>Poids: {request.weight} kg</p>}
                    {request.packagePrice && <p>💰 Colis: {request.packagePrice} FCFA</p>}
                    {request.deliveryPrice && <p>💰 Livraison: {request.deliveryPrice} FCFA</p>}
                  </div>

                  {/* Driver Assignment */}
                  <div className="info-section">
                    <h4>👨‍🚚 Livreur</h4>
                    {request.driverName ? (
                      <>
                        <p><strong>{request.driverName}</strong></p>
                        <p>☎️ {request.driverPhone}</p>
                      </>
                    ) : (
                      <p className="no-driver">À assigner</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="request-actions">
                  {request.status === 'pending_approval' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        ✅ Approuver
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(request.id)}
                      >
                        ❌ Rejeter
                      </button>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <a
                      href={generateWhatsAppLink(request)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      💬 Envoyer lien WhatsApp
                    </a>
                  )}

                  {request.rejectReason && (
                    <div className="reject-reason">
                      Raison: {request.rejectReason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryRequestsPage;
