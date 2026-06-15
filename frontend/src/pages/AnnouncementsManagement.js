/**
 * Announcements Management Page (Admin)
 * Manage announcements sent to clients
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/firebaseService';
import '../styles/PageLayout.css';
import '../styles/AnnouncementsManagement.css';

const AnnouncementsManagement = () => {
  // Helper function to get correct file URL
  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return url; // For Firebase Storage, we'll use URLs directly later
  };

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true,
    imageUrl: '',
    videoUrl: ''
  });
  const [message, setMessage] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await getAnnouncements();
      setAnnouncements(res);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setMessage('❌ Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data to save - image/video are optional!
      const announcementData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        isActive: formData.isActive,
        senderId: user?.uid || 'admin',
        senderName: user?.email || 'Admin'
      };
      
      // Only add image/video if provided
      if (formData.imageUrl) {
        announcementData.imageUrl = formData.imageUrl;
      }
      if (formData.videoUrl) {
        announcementData.videoUrl = formData.videoUrl;
      }

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, announcementData);
        setMessage('✅ Annonce mise à jour avec succès');
      } else {
        await createAnnouncement(announcementData);
        setMessage('✅ Annonce envoyée avec succès');
      }
      setShowModal(false);
      resetForm();
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setMessage('❌ Erreur lors de l\'enregistrement de l\'annonce');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      imageUrl: announcement.imageUrl || '',
      videoUrl: announcement.videoUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteAnnouncement(id);
        setMessage('✅ Annonce supprimée avec succès');
        loadAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        setMessage('❌ Erreur lors de la suppression de l\'annonce');
      }
    }
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      isActive: true,
      imageUrl: '',
      videoUrl: ''
    });
    setMessage('');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return '#3b82f6';
      case 'promo': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'important': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'info': return 'Information';
      case 'promo': return 'Promotion';
      case 'warning': return 'Avertissement';
      case 'important': return 'Important';
      default: return type;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-layout announcements-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-layout announcements-page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
          ← Retour au Dashboard
        </button>
        <div className="header-title">
          <h1>📢 Gestion des Annonces</h1>
          <p>Envoyez des annonces aux clients</p>
        </div>
        <button className="btn-primary" onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          + Nouvelle Annonce
        </button>
      </header>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="page-content">
        <div className="announcements-grid">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <p>Aucune annonce pour le moment</p>
            </div>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} className="announcement-card">
                {announcement.imageUrl && (
                  <div className="announcement-media">
                    <img src={getFileUrl(announcement.imageUrl)} alt={announcement.title} className="announcement-image" />
                  </div>
                )}
                {announcement.videoUrl && (
                  <div className="announcement-media">
                    <video 
                      src={getFileUrl(announcement.videoUrl)} 
                      className="announcement-video"
                      controls
                      preload="metadata"
                    />
                  </div>
                )}
                <div 
                  className="announcement-header" 
                  style={{ borderLeftColor: getTypeColor(announcement.type) }}
                >
                  <div className="announcement-meta">
                    <span 
                      className="type-badge" 
                      style={{ backgroundColor: getTypeColor(announcement.type) }}
                    >
                      {getTypeName(announcement.type)}
                    </span>
                    <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(announcement)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="announcement-title">{announcement.title}</h3>
                <p className="announcement-content">{announcement.content}</p>
                <div className="announcement-footer">
                  <span className="announcement-author">
                    Par: {announcement.senderName || 'Admin'}
                  </span>
                  <span className="announcement-date">
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image (URL - optionnel)</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="file-preview">
                    <img src={getFileUrl(formData.imageUrl)} alt="Aperçu" style={{maxWidth: '200px', borderRadius: '8px', marginTop: '0.5rem'}}/>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Vidéo (URL - optionnel)</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/video.mp4"
                />
              </div>
              <div className="form-group">
                <label>Type d'annonce</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="info">Information</option>
                  <option value="promo">Promotion</option>
                  <option value="warning">Avertissement</option>
                  <option value="important">Important</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Annonce active
                </label>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingAnnouncement ? 'Mettre à jour' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;
