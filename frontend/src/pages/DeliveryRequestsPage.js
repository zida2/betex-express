/**
 * Delivery Requests Management Page
 * Admin can view, edit, and send delivery requests to drivers
 * Handles both Express and Scheduled delivery types
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/DeliveryRequestsPage.css';

const DeliveryRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all'); // 'express', 'scheduled', 'all'
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editData, setEditData] = useState({
    deliveryPrice: '',
    driverId: '',
    adminNotes: '',
    timeSlotId: ''
  });

  // Mock data for testing
  const mockDeliveryRequests = [
    {
      id: 'req-001',
      senderName: 'Ahmed Diallo',
      senderPhone: '+226 70 50 50 50',
      senderAddress: 'Quartier 1, Ouagadougou',
      senderLatitude: 12.3656,
      senderLongitude: -1.5197,
      receiverName: 'Fatou Coulibaly',
      receiverPhone: '+226 70 60 60 60',
      receiverAddress: 'Secteur 4, Ouagadougou',
      receiverLatitude: 12.3700,
      receiverLongitude: -1.5250,
      packageType: 'colis',
      packagePrice: 50000,
      weight: 2.5,
      notes: 'Colis fragile - à manipuler avec soin',
      deliveryOption: 'express',
      distance: 5.2,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'req-002',
      senderName: 'Amadou Traore',
      senderPhone: '+226 70 70 70 70',
      senderAddress: 'Centre-ville, Ouagadougou',
      senderLatitude: 12.3656,
      senderLongitude: -1.5197,
      receiverName: 'Mariam Ndiaye',
      receiverPhone: '+226 70 80 80 80',
      receiverAddress: 'Zone Nord, Ouagadougou',
      receiverLatitude: 12.4100,
      receiverLongitude: -1.5300,
      packageType: 'nourriture',
      packagePrice: 0,
      weight: 1.0,
      notes: 'Livraison de repas - prioritaire',
      deliveryOption: 'express',
      distance: 8.5,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'req-003',
      senderName: 'Ibrahim Sow',
      senderPhone: '+226 70 90 90 90',
      senderAddress: 'Quartier 2, Ouagadougou',
      senderLatitude: 12.3550,
      senderLongitude: -1.5150,
      receiverName: 'Sophie Kabore',
      receiverPhone: '+226 70 15 15 15',
      receiverAddress: 'Secteur 5, Ouagadougou',
      receiverLatitude: 12.3200,
      receiverLongitude: -1.5000,
      packageType: 'document',
      packagePrice: 0,
      weight: 0.2,
      notes: 'Documents administratifs importants',
      deliveryOption: 'express',
      distance: 6.3,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'req-004',
      senderName: 'Alassane Samba',
      senderPhone: '+226 70 25 25 25',
      senderAddress: 'Centre Commercial, Ouagadougou',
      senderLatitude: 12.3656,
      senderLongitude: -1.5197,
      receiverName: 'Ismail Jallo',
      receiverPhone: '+226 70 35 35 35',
      receiverAddress: 'Secteur 6, Ouagadougou',
      receiverLatitude: 12.3100,
      receiverLongitude: -1.5050,
      packageType: 'colis',
      packagePrice: 75000,
      weight: 3.0,
      notes: 'Équipement électronique - emballage sécurisé demandé',
      deliveryOption: 'scheduled',
      timeSlot: 'Créneau du matin (09:00 - 12:00)',
      zone: 'Zone Centre-Ville',
      zonePrice: 1500,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 'req-005',
      senderName: 'Fanta Diallo',
      senderPhone: '+226 70 45 45 45',
      senderAddress: 'Quartier Résidentiel, Ouagadougou',
      senderLatitude: 12.3750,
      senderLongitude: -1.5300,
      receiverName: 'Moussa Ouedraogo',
      receiverPhone: '+226 70 55 55 55',
      receiverAddress: 'Zone Centre-Ville, Ouagadougou',
      receiverLatitude: 12.3656,
      receiverLongitude: -1.5197,
      packageType: 'other',
      packagePrice: 25000,
      weight: 1.5,
      notes: 'Colis standard - livraison flexible',
      deliveryOption: 'scheduled',
      timeSlot: 'Créneau de l\'après-midi (14:00 - 17:00)',
      zone: 'Zone Secteur 1-2',
      zonePrice: 1200,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req-006',
      senderName: 'Hassane Diop',
      senderPhone: '+226 70 65 65 65',
      senderAddress: 'Marché Central, Ouagadougou',
      senderLatitude: 12.3600,
      senderLongitude: -1.5200,
      receiverName: 'Aïssatou Bah',
      receiverPhone: '+226 70 75 75 75',
      receiverAddress: 'Kyassa, Ouagadougou',
      receiverLatitude: 12.4200,
      receiverLongitude: -1.5250,
      packageType: 'nourriture',
      packagePrice: 0,
      weight: 2.0,
      notes: 'Denrées alimentaires fraiches - livraison rapide',
      deliveryOption: 'express',
      distance: 4.7,
      status: 'approved',
      driverId: 'driver-1',
      driverName: 'Amadou Traore',
      driverPhone: '+226 70 50 50 50',
      deliveryPrice: 1675,
      approvedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    },
    {
      id: 'req-007',
      senderName: 'Yacouba Traore',
      senderPhone: '+226 70 85 85 85',
      senderAddress: 'Zone Industrielle, Ouagadougou',
      senderLatitude: 12.3500,
      senderLongitude: -1.5400,
      receiverName: 'Oumou Cisse',
      receiverPhone: '+226 70 95 95 95',
      receiverAddress: 'Quartier Administratif, Ouagadougou',
      receiverLatitude: 12.3750,
      receiverLongitude: -1.5150,
      packageType: 'document',
      packagePrice: 0,
      weight: 0.5,
      notes: 'Dossier pour signature officielle',
      deliveryOption: 'express',
      distance: 3.2,
      status: 'rejected',
      rejectReason: 'Adresse destinataire incomplète'
    },
    {
      id: 'req-008',
      senderName: 'Mariama Kone',
      senderPhone: '+226 70 11 11 11',
      senderAddress: 'Secteur 1, Ouagadougou',
      senderLatitude: 12.3550,
      senderLongitude: -1.5250,
      receiverName: 'Adama Sow',
      receiverPhone: '+226 70 22 22 22',
      receiverAddress: 'Secteur 3, Ouagadougou',
      receiverLatitude: 12.3400,
      receiverLongitude: -1.5300,
      packageType: 'fragile',
      packagePrice: 120000,
      weight: 5.0,
      notes: 'Équipement fragile - manipulation délicate requise',
      deliveryOption: 'scheduled',
      timeSlot: 'Créneau du matin (09:00 - 12:00)',
      zone: 'Zone Secteur 5-6',
      zonePrice: 1000,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadRequests();
    loadDrivers();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Try to load from API first
      try {
        const response = await api.get('/delivery-requests');
        console.log('API Response:', response.data.data);
        setRequests(response.data.data || mockDeliveryRequests);
      } catch (error) {
        // If API fails, use mock data
        console.warn('API failed, using mock delivery requests:', mockDeliveryRequests.length);
        setRequests(mockDeliveryRequests);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
      console.log('Setting mock data as fallback:', mockDeliveryRequests.length);
      setRequests(mockDeliveryRequests);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      setDriversLoading(true);
      // Try to load from API first
      try {
        const response = await api.get('/drivers');
        setDrivers(response.data.data || []);
      } catch (error) {
        // Mock drivers if API fails
        setDrivers([
          { id: 'driver-1', name: 'Amadou Traore', phone: '+226 70 50 50 50', status: 'available' },
          { id: 'driver-2', name: 'Fatoumata Diallo', phone: '+226 70 60 60 60', status: 'available' },
          { id: 'driver-3', name: 'Ibrahim Sow', phone: '+226 70 70 70 70', status: 'available' },
          { id: 'driver-4', name: 'Sophie Sanou', phone: '+226 70 80 80 80', status: 'busy' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    let statusMatch = true;
    let typeMatch = true;

    if (filter !== 'all') {
      statusMatch = req.status === filter;
    }

    if (deliveryTypeFilter !== 'all') {
      typeMatch = req.deliveryOption === deliveryTypeFilter;
    }

    return statusMatch && typeMatch;
  });

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setEditData({
      deliveryPrice: request.deliveryPrice || '',
      driverId: request.driverId || '',
      adminNotes: request.adminNotes || '',
      timeSlotId: request.timeSlotId || ''
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

    if (selectedRequest.deliveryOption === 'express' && !editData.driverId) {
      setMessage('❌ Veuillez sélectionner un livreur pour Express');
      return;
    }

    if (selectedRequest.deliveryOption === 'scheduled' && !editData.timeSlotId) {
      setMessage('❌ Veuillez sélectionner un créneau horaire');
      return;
    }

    try {
      const selectedDriver = drivers.find(d => d.id == editData.driverId);
      
      const updatedRequest = {
        ...selectedRequest,
        ...editData,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        ...(selectedRequest.deliveryOption === 'express' && {
          driverId: parseInt(editData.driverId),
          driverName: selectedDriver?.name,
          driverPhone: selectedDriver?.phone
        })
      };

      setRequests(requests.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ));

      setMessage('✅ Demande approuvée avec succès!');
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

  const getDeliveryTypeLabel = (type) => {
    return type === 'express' ? '🚀 Express' : '📅 Programmée';
  };

  const getPricingInfo = (request) => {
    if (request.deliveryOption === 'express') {
      return `Distance: ${request.distance}km | Prix estimé: ${500 + (request.distance * 250)} FCFA`;
    } else {
      return `Zone: ${request.zone} | Prix fixe: ${request.zonePrice} FCFA`;
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

      {/* Status Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>État:</label>
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

        {/* Delivery Type Filters */}
        <div className="filter-group">
          <label>Type de livraison:</label>
          <button
            className={`filter-btn ${deliveryTypeFilter === 'express' ? 'active' : ''}`}
            onClick={() => setDeliveryTypeFilter('express')}
          >
            🚀 Express ({requests.filter(r => r.deliveryOption === 'express').length})
          </button>
          <button
            className={`filter-btn ${deliveryTypeFilter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setDeliveryTypeFilter('scheduled')}
          >
            📅 Programmée ({requests.filter(r => r.deliveryOption === 'scheduled').length})
          </button>
          <button
            className={`filter-btn ${deliveryTypeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDeliveryTypeFilter('all')}
          >
            📦 Tous les types
          </button>
        </div>
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
                    className={`request-item-preview ${selectedRequest?.id === request.id ? 'active' : ''} status-${request.status} type-${request.deliveryOption}`}
                    onClick={() => handleSelectRequest(request)}
                  >
                    <div className="preview-header">
                      <div>
                        <h4>#{request.id}</h4>
                        <span className="delivery-type-badge">{getDeliveryTypeLabel(request.deliveryOption)}</span>
                      </div>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status === 'pending_approval' && '⏳'}
                        {request.status === 'approved' && '✅'}
                        {request.status === 'rejected' && '❌'}
                      </span>
                    </div>
                    <p className="preview-text"><strong>{request.receiverName}</strong></p>
                    <p className="preview-text">☎️ {request.receiverPhone}</p>
                    <p className="preview-text">📍 {request.receiverAddress || 'Non spécifié'}</p>
                    <p className="preview-pricing">{getPricingInfo(request)}</p>
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
                  <div>
                    <h2>Demande #{selectedRequest.id}</h2>
                    <span className="delivery-type-badge large">{getDeliveryTypeLabel(selectedRequest.deliveryOption)}</span>
                  </div>
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
                      {selectedRequest.senderLatitude && selectedRequest.senderLongitude && (
                        <div className="info-field">
                          <label>Coordonnées</label>
                          <p>{selectedRequest.senderLatitude}, {selectedRequest.senderLongitude}</p>
                        </div>
                      )}
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
                      {selectedRequest.receiverLatitude && selectedRequest.receiverLongitude && (
                        <div className="info-field">
                          <label>Coordonnées</label>
                          <p>{selectedRequest.receiverLatitude}, {selectedRequest.receiverLongitude}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Package Info */}
                  <section className="info-section">
                    <h3>📦 Colis</h3>
                    <div className="info-group">
                      <div className="info-field">
                        <label>Type</label>
                        <p>{selectedRequest.packageType}</p>
                      </div>
                      {selectedRequest.notes && (
                        <div className="info-field">
                          <label>Notes</label>
                          <p>{selectedRequest.notes}</p>
                        </div>
                      )}
                      {selectedRequest.weight && (
                        <div className="info-field">
                          <label>Poids</label>
                          <p>{selectedRequest.weight} kg</p>
                        </div>
                      )}
                      {selectedRequest.packagePrice > 0 && (
                        <div className="info-field">
                          <label>Prix du colis</label>
                          <p>{selectedRequest.packagePrice} FCFA</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Pricing Info */}
                  <section className="info-section">
                    <h3>💰 Informations de Tarification</h3>
                    <div className="info-group">
                      {selectedRequest.deliveryOption === 'express' && (
                        <>
                          <div className="info-field">
                            <label>Distance</label>
                            <p>{selectedRequest.distance} km</p>
                          </div>
                          <div className="info-field">
                            <label>Calcul</label>
                            <p>500 FCFA + ({selectedRequest.distance} × 250 FCFA/km) = {500 + (selectedRequest.distance * 250)} FCFA</p>
                          </div>
                        </>
                      )}
                      {selectedRequest.deliveryOption === 'scheduled' && (
                        <>
                          <div className="info-field">
                            <label>Zone</label>
                            <p>{selectedRequest.zone}</p>
                          </div>
                          <div className="info-field">
                            <label>Créneau</label>
                            <p>{selectedRequest.timeSlot}</p>
                          </div>
                          <div className="info-field">
                            <label>Prix fixe zone</label>
                            <p>{selectedRequest.zonePrice} FCFA</p>
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  {/* Admin Completion Form */}
                  {selectedRequest.status === 'pending_approval' && (
                    <section className="edit-section">
                      <h3>✏️ À Compléter par l'Admin</h3>

                      <div className="form-group">
                        <label>💰 Prix de la livraison (FCFA) <span className="required">*</span></label>
                        <input
                          type="number"
                          name="deliveryPrice"
                          value={editData.deliveryPrice}
                          onChange={handleEditChange}
                          placeholder={selectedRequest.deliveryOption === 'express' 
                            ? Math.round(500 + (selectedRequest.distance * 250)) 
                            : selectedRequest.zonePrice}
                          min="0"
                        />
                      </div>

                      {selectedRequest.deliveryOption === 'express' && (
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
                      )}

                      {selectedRequest.deliveryOption === 'scheduled' && (
                        <div className="form-group">
                          <label>⏰ Confirmer le créneau <span className="required">*</span></label>
                          <select
                            name="timeSlotId"
                            value={editData.timeSlotId}
                            onChange={handleEditChange}
                          >
                            <option value="">-- Confirmer le créneau --</option>
                            <option value="slot-1">Créneau du matin (09:00 - 12:00)</option>
                            <option value="slot-2">Créneau de l'après-midi (14:00 - 17:00)</option>
                          </select>
                        </div>
                      )}

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
                        <button className="btn-approve" onClick={handleApprove}>
                          ✅ Approuver
                        </button>
                        <button className="btn-reject" onClick={handleReject}>
                          ❌ Rejeter
                        </button>
                      </div>
                    </section>
                  )}

                  {selectedRequest.status === 'rejected' && (
                    <section className="status-section">
                      <h3>❌ Demande Rejetée</h3>
                      <div className="reject-info">
                        <p><strong>Raison:</strong> {selectedRequest.rejectReason}</p>
                      </div>
                    </section>
                  )}

                  {selectedRequest.status === 'approved' && (
                    <section className="status-section">
                      <h3>✅ Demande Approuvée</h3>
                      <div className="approved-info">
                        {selectedRequest.deliveryOption === 'express' && (
                          <p><strong>Livreur assigné:</strong> {selectedRequest.driverName} ({selectedRequest.driverPhone})</p>
                        )}
                        {selectedRequest.deliveryOption === 'scheduled' && (
                          <p><strong>Créneau confirmé:</strong> {selectedRequest.timeSlot}</p>
                        )}
                        <p><strong>Prix approuvé:</strong> {selectedRequest.deliveryPrice} FCFA</p>
                        <p><strong>Approuvé le:</strong> {new Date(selectedRequest.approvedAt).toLocaleString('fr-FR')}</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                👆 Cliquez sur une demande pour voir les détails
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryRequestsPage;
