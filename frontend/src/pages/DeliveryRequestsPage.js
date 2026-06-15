/**
 * Delivery Requests Management Page - Modal Version
 * Small cards with modal for details and editing
 */

import React, { useState, useEffect } from 'react';
import { getDeliveryRequests, getDrivers, updateDeliveryRequest, createPackage } from '../services/firebaseService';
import '../styles/DeliveryRequestsPage.css';
import '../styles/PageLayout.css';

const DeliveryRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [suggestedDriver, setSuggestedDriver] = useState(null);
  const [editData, setEditData] = useState({
    deliveryPrice: '',
    driverId: '',
    adminNotes: '',
    timeSlotId: ''
  });

  useEffect(() => {
    loadRequests();
    loadDrivers();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setMessage('❌ Erreur de chargement des demandes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      setDriversLoading(true);
      const data = await getDrivers();
      setDrivers(data || []);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setMessage('⚠️ Erreur de chargement des livreurs');
      setDrivers([]);
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
      typeMatch = req.deliveryType === deliveryTypeFilter;
    }

    return statusMatch && typeMatch;
  });

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const findNearestDriver = (request) => {
    if (!drivers.length || !request.senderLat || !request.senderLng) {
      setSuggestedDriver(null);
      return null;
    }

    let nearestDriver = null;
    let minDistance = Infinity;

    drivers.forEach(driver => {
      if (driver.currentLat && driver.currentLng) {
        const distance = calculateDistance(
          request.senderLat,
          request.senderLng,
          driver.currentLat,
          driver.currentLng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = { ...driver, distance: distance.toFixed(2) };
        }
      }
    });

    setSuggestedDriver(nearestDriver);
    return nearestDriver;
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);

    // Find nearest driver for any delivery type with sender coordinates
    if (request.senderLat && request.senderLng) {
      const nearest = findNearestDriver(request);
      
      setEditData({
        deliveryPrice: request.deliveryPrice || (request.distanceKm ? Math.round(500 + (request.distanceKm * 250)) : ''),
        driverId: nearest ? nearest.id : request.driverId || '',
        adminNotes: request.adminNotes || '',
        timeSlotId: request.timeSlotId || ''
      });
    } else {
      setEditData({
        deliveryPrice: request.deliveryPrice || '',
        driverId: request.driverId || '',
        adminNotes: request.adminNotes || '',
        timeSlotId: request.timeSlotId || ''
      });
      setSuggestedDriver(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
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

    if (!selectedRequest.receiverLat || !selectedRequest.receiverLng) {
      setMessage('❌ La localisation du destinataire est requise pour approuver');
      return;
    }

    try {
      // Trouver le livreur sélectionné pour avoir son nom
      const selectedDriver = drivers.find(d => d.id === editData.driverId);
      
      // Mettre à jour la demande de livraison
      await updateDeliveryRequest(selectedRequest.id, {
        driverId: editData.driverId || null,
        driverName: selectedDriver?.name || null,
        adminNotes: editData.adminNotes || '',
        deliveryPrice: editData.deliveryPrice,
        status: 'approved',
        approvedAt: new Date()
      });
      
      // Créer un nouveau package pour cette demande (si un livreur est assigné)
      if (editData.driverId) {
        await createPackage({
          customerName: selectedRequest.receiverName,
          customerPhone: selectedRequest.receiverPhone,
          address: selectedRequest.receiverAddress,
          senderName: selectedRequest.senderName,
          senderPhone: selectedRequest.senderPhone,
          senderAddress: selectedRequest.senderAddress,
          senderLatitude: selectedRequest.senderLat,
          senderLongitude: selectedRequest.senderLng,
          deliveryLatitude: selectedRequest.receiverLat,
          deliveryLongitude: selectedRequest.receiverLng,
          packageType: selectedRequest.description || 'Colis',
          packagePrice: selectedRequest.packagePrice || 0,
          weight: selectedRequest.weight || null,
          notes: selectedRequest.adminNotes || '',
          deliveryOption: selectedRequest.deliveryType,
          deliveryPrice: editData.deliveryPrice,
          driverId: editData.driverId,
          driverName: selectedDriver?.name,
          status: 'assigned'
        });
      }

      await loadRequests();
      
      // Envoyer notification WhatsApp au client seulement si un livreur est assigné
      if (editData.driverId) {
        await sendClientNotification(selectedRequest, editData.driverId);
      }
      
      setMessage('✅ Demande approuvée avec succès!');
      setShowModal(false);
      setSelectedRequest(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erreur lors de l'approbation: ${error.message}`);
      console.error('Error:', error);
    }
  };

  const sendClientNotification = async (request, driverId) => {
    try {
      // Récupérer les infos du livreur
      const driver = drivers.find(d => d.id === driverId);
      
      if (driver && request.senderPhone) {
        const clientMessage = encodeURIComponent(
          `🛵 *BETEX EXPRESS* - Confirmation de Livraison\n` +
          `═══════════════════════════════════\n\n` +
          `Bonjour ${request.senderName},\n\n` +
          `🎉 *EXCELLENTE NOUVELLE !*\n` +
          `Votre demande de livraison a été approuvée et prise en charge.\n\n` +
          
          `📦 *RÉCAPITULATIF DE VOTRE ENVOI*\n` +
          `┌─────────────────────────────┐\n` +
          `│ Destinataire : ${request.receiverName}\n` +
          `│ Téléphone : ${request.receiverPhone}\n` +
          `│ Description : ${request.description || 'Non spécifiée'}\n` +
          `│ Poids : ${request.weight ? request.weight + ' kg' : 'Non spécifié'}\n` +
          `│ Type : ${request.deliveryType === 'express' ? '🚀 Express' : '📅 Programmée'}\n` +
          `│ Frais de livraison : ${editData.deliveryPrice} FCFA\n` +
          `└─────────────────────────────┘\n\n` +
          
          `🚚 *VOTRE LIVREUR ASSIGNÉ*\n` +
          `┌─────────────────────────────┐\n` +
          `│ Nom : ${driver.name}\n` +
          `│ Téléphone : ${driver.phone}\n` +
          `│ Véhicule : ${driver.vehicleType || 'Moto'}\n` +
          `└─────────────────────────────┘\n\n` +
          
          `🚀 *PROCHAINES ÉTAPES*\n` +
          `• Votre livreur va bientôt commencer sa mission\n` +
          `• Il vous contactera avant la collecte\n` +
          `• Suivez l'évolution via notre système\n\n` +
          
          `📞 *CONTACT LIVREUR*\n` +
          `Vous pouvez contacter directement votre livreur au : ${driver.phone}\n\n` +
          
          `📍 *SUIVI EN TEMPS RÉEL*\n` +
          `Votre colis sera suivi tout au long de sa livraison.\n\n` +
          
          `Merci de votre confiance,\n` +
          `*L'équipe BETEX EXPRESS* 🚚💨\n` +
          `_Livraison rapide et sécurisée_`
        );
        
        const clientPhone = request.senderPhone.replace(/\s+/g, '').replace(/\+/g, '');
        const whatsappUrl = `https://wa.me/${clientPhone}?text=${clientMessage}`;
        
        console.log('Client notification prepared:', whatsappUrl);
      }
    } catch (error) {
      console.error('Error preparing client notification:', error);
    }
  };

  const handleReject = async () => {
    const rejectionReason = prompt('Raison du rejet:');
    if (!rejectionReason) return;

    try {
      await updateDeliveryRequest(selectedRequest.id, {
        rejectionReason,
        status: 'rejected'
      });

      await loadRequests();
      setMessage('❌ Demande rejetée');
      setShowModal(false);
      setSelectedRequest(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erreur lors du rejet: ${error.message}`);
      console.error('Error:', error);
    }
  };

  const handleGenerateLocationLink = (request) => {
    // Générer un token unique pour cette demande
    const locationToken = btoa(`${request.id}-${Date.now()}`);
    
    // Créer le lien de localisation
    const locationLink = `${window.location.origin}/location/${locationToken}`;
    
    // Formater le message WhatsApp professionnel avec tous les détails
    const whatsappMessage = encodeURIComponent(
      `BETEX EXPRESS - Service de Livraison\n` +
      `=======================================\n\n` +
      `Bonjour ${request.receiverName},\n\n` +
      `Vous avez un colis en attente de livraison :\n\n` +
      
      `DETAILS DU COLIS\n` +
      `-------------------------------\n` +
      `Expediteur : ${request.senderName}\n` +
      `Telephone : ${request.senderPhone}\n` +
      `Description : ${request.description || 'Non specifiee'}\n` +
      `Poids : ${request.weight ? request.weight + ' kg' : 'Non specifie'}\n` +
      `Valeur : ${request.packagePrice ? request.packagePrice.toLocaleString() + ' FCFA' : 'Non specifiee'}\n` +
      `Type : ${request.deliveryType === 'express' ? 'EXPRESS' : 'PROGRAMMEE'}\n` +
      (request.deliveryPrice ? `Frais livraison : ${request.deliveryPrice.toLocaleString()} FCFA\n` : '') +
      (request.scheduledDate ? `Date prevue : ${new Date(request.scheduledDate).toLocaleDateString('fr-FR')}\n` : '') +
      (request.timeSlot ? `Creneau : ${request.timeSlot}\n` : '') +
      `-------------------------------\n\n` +
      
      `LOCALISATION REQUISE\n` +
      `Pour que notre livreur puisse vous trouver facilement, nous avons besoin de votre position GPS precise.\n\n` +
      
      `ETAPES A SUIVRE :\n` +
      `1. Cliquez sur le lien ci-dessous\n` +
      `2. Autorisez l'acces a votre localisation\n` +
      `3. Votre position sera automatiquement enregistree\n\n` +
      
      `LIEN SECURISE :\n` +
      `${locationLink}\n\n` +
      
      `IMPORTANT :\n` +
      `- Ce lien est valide pendant 7 jours\n` +
      `- Votre localisation est securisee et confidentielle\n` +
      `- Une fois votre position enregistree, nous traiterons rapidement votre livraison\n\n` +
      
      `BESOIN D'AIDE ?\n` +
      `Contactez-nous au : +225 XX XX XX XX\n\n` +
      
      `Merci de votre confiance,\n` +
      `L'equipe BETEX EXPRESS\n` +
      `Livraison rapide et securisee`
    );
    
    // Nettoyer le numéro de téléphone (enlever espaces et garder uniquement les chiffres)
    const cleanPhone = request.receiverPhone.replace(/\s+/g, '').replace(/\+/g, '');
    
    // Ouvrir WhatsApp avec le message pré-rempli
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
    
    // Sauvegarder le token dans la base de données
    saveLocationToken(request.id, locationToken);
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
    
    setMessage('✅ Message WhatsApp professionnel généré avec tous les détails du colis! Le destinataire peut maintenant partager sa localisation.');
    setTimeout(() => setMessage(''), 6000);
  };

  const saveLocationToken = async (requestId, token) => {
    try {
      await updateDeliveryRequest(requestId, { locationToken: token });
    } catch (error) {
      console.error('Error saving location token:', error);
    }
  };

  return (
    <div className="page-layout delivery-requests-page">
      <header className="page-header requests-header">
        <h1>📋 Demandes de Livraison</h1>
        <p>Cliquez sur une carte pour voir les détails et approuver</p>
      </header>

      <div className="page-content">
        {message && (
          <div className={`alert ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Filtres Compacts */}
        <div className="filters-compact">
          <div className="filter-inline">
            <label>État:</label>
            <select 
              className="filter-select"
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">📊 Toutes ({requests.length})</option>
                      <option value="pending">⏳ En attente ({requests.filter(r => r.status === 'pending').length})</option>
                      <option value="approved">✅ Approuvées ({requests.filter(r => r.status === 'approved').length})</option>
                      <option value="rejected">❌ Rejetées ({requests.filter(r => r.status === 'rejected').length})</option>
            </select>
          </div>

          <div className="filter-inline">
            <label>Type:</label>
            <select 
              className="filter-select"
              value={deliveryTypeFilter} 
              onChange={(e) => setDeliveryTypeFilter(e.target.value)}
            >
              <option value="all">📦 Tous</option>
              <option value="express">🚀 Express ({requests.filter(r => r.deliveryType === 'express').length})</option>
              <option value="scheduled">📅 Programmée ({requests.filter(r => r.deliveryType === 'scheduled').length})</option>
            </select>
          </div>

          <button className="btn-refresh" onClick={loadRequests} title="Actualiser">
            🔄 Actualiser
          </button>
        </div>

        {/* Grille de mini-cartes */}
        <main className="requests-content">
          {loading ? (
            <div className="loading">⏳ Chargement...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="no-data">Aucune demande pour ce filtre</div>
          ) : (
            <div className="requests-grid">
              {filteredRequests.map(request => (
                <div
                  key={request.id}
                  className={`mini-card status-${request.status}`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="mini-card-top">
                    <div className="status-dot"></div>
                    <div className="mini-type">
                      {request.deliveryType === 'express' ? '🚀' : '📅'}
                    </div>
                    <div className="mini-id">#{request.id.substring(0, 6)}</div>
                  </div>
                  
                  <div className="mini-card-main">
                    <div className="mini-name">
                      <span className="mini-icon">📤</span>
                      <span>{request.senderName}</span>
                    </div>
                    <div className="mini-arrow">→</div>
                    <div className="mini-name">
                      <span className="mini-icon">📥</span>
                      <span>{request.receiverName}</span>
                    </div>
                  </div>

                  <div className="mini-card-bottom">
                    {request.deliveryPrice != null && (
                      <span className="mini-price">{Number(request.deliveryPrice).toLocaleString()} FCFA</span>
                    )}
                    {request.status === 'pending' && (!request.receiverLat || !request.receiverLng) && (
                      <span className="location-alert">📍</span>
                    )}
                    {request.senderQuartier && (
                      <span className="mini-quartier">{request.senderQuartier}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal pour détails et édition */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>#{selectedRequest.id.substring(0, 8)}</h2>
                <span className={`type-badge-modal type-${selectedRequest.deliveryType}`}>
                  {selectedRequest.deliveryType === 'express' ? '🚀 Express' : '📅 Programmée'}
                </span>
              </div>
              <button className="btn-close-modal" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Expéditeur */}
              <section className="modal-section">
                <h3>📤 Expéditeur</h3>
                <div className="info-grid">
                  <div><label>Nom:</label><p>{selectedRequest.senderName}</p></div>
                  <div><label>Téléphone:</label><p>{selectedRequest.senderPhone}</p></div>
                  {selectedRequest.senderQuartier && (
                    <div><label>🏘️ Quartier:</label><p style={{color: '#00ff88', fontWeight: '600'}}>{selectedRequest.senderQuartier}</p></div>
                  )}
                  {selectedRequest.senderZone && (
                    <div><label>📍 Zone:</label><p style={{color: '#00d4aa'}}>{selectedRequest.senderZone}</p></div>
                  )}
                  {selectedRequest.senderAddress && (
                    <div className="full-width"><label>Adresse:</label><p>{selectedRequest.senderAddress}</p></div>
                  )}
                </div>
              </section>

              {/* Destinataire */}
              <section className="modal-section">
                <h3>📥 Destinataire</h3>
                <div className="info-grid">
                  <div><label>Nom:</label><p>{selectedRequest.receiverName}</p></div>
                  <div><label>Téléphone:</label><p>{selectedRequest.receiverPhone}</p></div>
                  {selectedRequest.receiverQuartier && (
                    <div><label>🏘️ Quartier:</label><p style={{color: '#00ff88', fontWeight: '600'}}>{selectedRequest.receiverQuartier}</p></div>
                  )}
                  {selectedRequest.receiverZone && (
                    <div><label>📍 Zone:</label><p style={{color: '#00d4aa'}}>{selectedRequest.receiverZone}</p></div>
                  )}
                  {selectedRequest.receiverAddress && (
                    <div className="full-width"><label>Adresse:</label><p>{selectedRequest.receiverAddress}</p></div>
                  )}
                  <div className="full-width">
                    <label>Localisation GPS:</label>
                    {selectedRequest.receiverLat && selectedRequest.receiverLng ? (
                      <p style={{color: '#22c55e', fontWeight: '600'}}>
                        ✅ Localisé ({selectedRequest.receiverLat}, {selectedRequest.receiverLng})
                      </p>
                    ) : (
                      <div style={{marginTop: '0.5rem'}}>
                        <p style={{color: '#ef4444', fontWeight: '600', marginBottom: '0.5rem'}}>
                          ❌ Localisation manquante
                        </p>
                        <button 
                          className="btn-generate-link"
                          onClick={() => handleGenerateLocationLink(selectedRequest)}
                        >
                          📍 Générer Lien WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Colis */}
              <section className="modal-section">
                <h3>📦 Colis</h3>
                <div className="info-grid">
                  {selectedRequest.description && (
                    <div><label>Description:</label><p>{selectedRequest.description}</p></div>
                  )}
                  {selectedRequest.weight && (
                    <div><label>Poids:</label><p>{selectedRequest.weight} kg</p></div>
                  )}
                  {selectedRequest.packagePrice > 0 && (
                    <div><label>Valeur:</label><p>{selectedRequest.packagePrice} FCFA</p></div>
                  )}
                  {selectedRequest.deliveryType === 'express' && selectedRequest.distanceKm && (
                    <div><label>Distance:</label><p>{selectedRequest.distanceKm} km</p></div>
                  )}
                </div>
              </section>

              {/* Formulaire Admin */}
                  {selectedRequest.status === 'pending' && (
                    <section className="modal-section edit">
                  <h3>✏️ Compléter par l'Admin</h3>

                  {/* Message si localisation manquante */}
                  {!selectedRequest.receiverLat && !selectedRequest.receiverLng && (
                    <div className="location-warning">
                      <p>⚠️ <strong>Localisation du destinataire manquante</strong></p>
                      <p>Générez un lien WhatsApp pour que le destinataire partage sa localisation avant d'approuver la demande.</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>💰 Prix de livraison (FCFA) *</label>
                    <input
                      type="number"
                      name="deliveryPrice"
                      value={editData.deliveryPrice}
                      onChange={handleEditChange}
                      placeholder={selectedRequest.deliveryType === 'express' && selectedRequest.distanceKm
                        ? Math.round(500 + (selectedRequest.distanceKm * 250)) 
                        : 2000}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>👨‍🚚 Assigner un livreur</label>
                    
                    {suggestedDriver && (
                      <div className="suggested-driver">
                        <div className="suggested-header">🎉 Livreur le plus proche suggéré</div>
                        <div className="suggested-info">
                          <span className="driver-name">{suggestedDriver.name}</span>
                          <span className="driver-phone">{suggestedDriver.phone}</span>
                          <span className="driver-distance">📍 {suggestedDriver.distance} km</span>
                          <span className="driver-vehicle">🚗 {suggestedDriver.vehicleType || 'Moto'}</span>
                        </div>
                      </div>
                    )}

                    {driversLoading ? (
                      <div className="loading-small">⏳ Chargement...</div>
                    ) : (
                      <select name="driverId" value={editData.driverId} onChange={handleEditChange}>
                        <option value="">-- Sélectionner un livreur (optionnel) --</option>
                        {drivers.map(driver => {
                          let label = `${driver.name} - ${driver.phone}`;
                          if (driver.currentLat && driver.currentLng && selectedRequest.senderLat && selectedRequest.senderLng) {
                            const dist = calculateDistance(
                              selectedRequest.senderLat,
                              selectedRequest.senderLng,
                              driver.currentLat,
                              driver.currentLng
                            );
                            label += ` (${dist.toFixed(2)} km)`;
                          }
                          return (
                            <option key={driver.id} value={driver.id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label>📝 Notes admin</label>
                    <textarea
                      name="adminNotes"
                      value={editData.adminNotes}
                      onChange={handleEditChange}
                      placeholder="Notes..."
                      rows="2"
                    />
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="btn-approve" 
                      onClick={handleApprove}
                      disabled={!selectedRequest.receiverLat || !selectedRequest.receiverLng}
                      title={!selectedRequest.receiverLat || !selectedRequest.receiverLng ? 
                        'Localisation du destinataire requise pour approuver' : 
                        'Approuver cette demande'}
                    >
                      ✅ Approuver
                    </button>
                    <button className="btn-reject" onClick={handleReject}>❌ Rejeter</button>
                  </div>
                </section>
              )}

              {/* Statut Approuvé */}
              {selectedRequest.status === 'approved' && (
                <section className="modal-section approved">
                  <h3>✅ Approuvée</h3>
                  <div className="status-info">
                    {selectedRequest.driverName && (
                      <p><strong>Livreur:</strong> {selectedRequest.driverName}</p>
                    )}
                    <p><strong>Prix:</strong> {selectedRequest.deliveryPrice} FCFA</p>
                    {selectedRequest.approvedAt && (
                      <p><strong>Le:</strong> {new Date(selectedRequest.approvedAt).toLocaleString('fr-FR')}</p>
                    )}
                  </div>
                </section>
              )}

              {/* Statut Rejeté */}
              {selectedRequest.status === 'rejected' && (
                <section className="modal-section rejected">
                  <h3>❌ Rejetée</h3>
                  <div className="status-info">
                    <p><strong>Raison:</strong> {selectedRequest.rejectionReason || 'Non spécifiée'}</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRequestsPage;
