/**
 * Delivery Requests Management Page
 * Admin can view, edit, and send delivery requests to drivers
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/DeliveryRequestsPage.css';

const DeliveryRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);
  const [filter, setFilter] = useState('pending_approval');
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editData, setEditData] = useState({
    deliveryPrice: '',
    driverId: '',
    adminNotes: ''
  });

  useEffect(() => {
    loadRequests();
    loadDrivers();
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

  const loadDrivers = async () => {
    try {
      setDriversLoading(true);
      const response = await api.get('/drivers');
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setEditData({
      deliveryPrice: request.deliveryPrice || '',
      driverId: request.driverId || '',
      adminNotes: request.adminNotes || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApprove = async () => {
    if (!editData.deliveryPrice) {
      setMessage('❌ Veuillez entrer le prix de livraison');
      return;
    }
    if (!editData.driverId) {
      setMessage('❌ Veuillez sélectionner un livreur');
      return;
    }

    try {
      const selectedDriver = drivers.find(d => d.id == editData.driverId);
      
      // Generate WhatsApp link for destinatary geolocation capture
      const locationCaptureLink = `${window.location.origin}/delivery-location/${selectedRequest.id}`;
      const whatsappMessage = `Bonjour ${selectedRequest.receiverName}, cliquez sur ce lien pour confirmer votre localisation: ${locationCaptureLink}`;
      const whatsappLink = `https://wa.me/${selectedRequest.receiverPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      
      const updatedRequest = {
        ...selectedRequest,
        ...editData,
        driverId: parseInt(editData.driverId),
        driverName: selectedDriver?.name,
        driverPhone: selectedDriver?.phone,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        whatsappLink: whatsappLink,
        locationLink: locationCaptureLink
      };

      setRequests(requests.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ));

      setMessage('✅ Demande approuvée et envoyée au livreur!');
      setSelectedRequest(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'approbation');
      console.error('Error:', error);
    }
  };

  const handleReject = async () => {
    const rejectReason = prompt('Raison du rejet:');
    if (!rejectReason) return;

    try {
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected', rejectReason }
          : req
      ));
      setMessage('❌ Demande rejetée');
      setSelectedRequest(null);
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
        <p>Approuvez, complétez les informations et envoyez au livreur</p>
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
        <div className="requests-layout">
          {/* List View */}
          <div className="requests-list-panel">
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="no-data">Aucune demande pour ce filtre</div>
            ) : (
              <div className="requests-list">
                {filteredRequests.map(request => (
                  <div
                    key={request.id}
                    className={`request-item-preview ${selectedRequest?.id === request.id ? 'active' : ''} status-${request.status}`}
                    onClick={() => handleSelectRequest(request)}
                  >
                    <div className="preview-header">
                      <h4>#{request.id} - {request.receiverName}</h4>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status === 'pending_approval' && '⏳'}
                        {request.status === 'approved' && '✅'}
                        {request.status === 'rejected' && '❌'}
                      </span>
                    </div>
                    <p className="preview-text">☎️ {request.receiverPhone}</p>
                    <p className="preview-text">📍 {request.receiverAddress || 'Non spécifié'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail View */}
          <div className="request-detail-panel">
            {selectedRequest ? (
              <div className="detail-form">
                <div className="detail-header">
                  <h2>Demande #{selectedRequest.id}</h2>
                  <button className="btn-close" onClick={() => setSelectedRequest(null)}>✕</button>
                </div>

                <div className="detail-sections">
                  {/* Sender Info */}
                  <section className="info-section">
                    <h3>📤 Expéditeur</h3>
                    <div className="info-group">
                      <div className="info-field">
                        <label>Nom</label>
                        <p>{selectedRequest.senderName}</p>
                      </div>
                      <div className="info-field">
                        <label>Téléphone</label>
                        <p>{selectedRequest.senderPhone}</p>
                      </div>
                      <div className="info-field">
                        <label>Adresse</label>
                        <p>{selectedRequest.senderAddress || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </section>

                  {/* Receiver Info */}
                  <section className="info-section">
                    <h3>📥 Destinataire</h3>
                    <div className="info-group">
                      <div className="info-field">
                        <label>Nom</label>
                        <p>{selectedRequest.receiverName}</p>
                      </div>
                      <div className="info-field">
                        <label>Téléphone</label>
                        <p>{selectedRequest.receiverPhone}</p>
                      </div>
                      <div className="info-field">
                        <label>Adresse</label>
                        <p>{selectedRequest.receiverAddress || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </section>

                  {/* Package Info */}
                  <section className="info-section">
                    <h3>📦 Colis</h3>
                    <div className="info-group">
                      {selectedRequest.description && (
                        <div className="info-field">
                          <label>Description</label>
                          <p>{selectedRequest.description}</p>
                        </div>
                      )}
                      {selectedRequest.weight && (
                        <div className="info-field">
                          <label>Poids</label>
                          <p>{selectedRequest.weight} kg</p>
                        </div>
                      )}
                      {selectedRequest.packagePrice && (
                        <div className="info-field">
                          <label>Prix du colis</label>
                          <p>{selectedRequest.packagePrice} FCFA</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Admin Completion Form */}
                  <section className="edit-section">
                    <h3>✏️ À Compléter par l'Admin</h3>

                    <div className="form-group">
                      <label>💰 Prix de la livraison (FCFA) <span className="required">*</span></label>
                      <input
                        type="number"
                        name="deliveryPrice"
                        value={editData.deliveryPrice}
                        onChange={handleEditChange}
                        placeholder="5000"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>👨‍🚚 Assigner un livreur <span className="required">*</span></label>
                      {driversLoading ? (
                        <div className="loading-small">⏳ Chargement des livreurs...</div>
                      ) : (
                        <select
                          name="driverId"
                          value={editData.driverId}
                          onChange={handleEditChange}
                        >
                          <option value="">-- Sélectionner un livreur --</option>
                          {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} - {driver.phone} ({driver.status})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="form-group">
                      <label>📝 Notes de l'admin</label>
                      <textarea
                        name="adminNotes"
                        value={editData.adminNotes}
                        onChange={handleEditChange}
                        placeholder="Notes pour le livreur..."
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      {selectedRequest.status === 'pending_approval' && (
                        <>
                          <button className="btn-approve" onClick={handleApprove}>
                            ✅ Approuver et Envoyer au Livreur
                          </button>
                          <button className="btn-reject" onClick={handleReject}>
                            ❌ Rejeter
                          </button>
                        </>
                      )}

                      {selectedRequest.status === 'rejected' && (
                        <div className="reject-info">
                          ❌ Raison: {selectedRequest.rejectReason}
                        </div>
                      )}

                      {selectedRequest.status === 'approved' && (
                        <div className="approved-info">
                          <div>✅ Approuvée et envoyée à: <strong>{selectedRequest.driverName}</strong></div>
                          <button 
                            className="btn-whatsapp"
                            onClick={() => window.open(selectedRequest.whatsappLink, '_blank')}
                            style={{ marginTop: '1rem' }}
                          >
                            💬 Envoyer lien de localisation par WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                Cliquez sur une demande pour voir les détails
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryRequestsPage;
