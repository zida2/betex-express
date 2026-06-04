/**
 * Translations - French translations for status and labels
 */

// Status translations
export const STATUS_TRANSLATIONS = {
  // Package status
  pending: 'En attente',
  collected: 'Collecté',
  in_transit: 'En transit',
  in_delivery: 'En livraison',
  delivered: 'Livré',
  delivery_failed: 'Échec',
  cancelled: 'Annulé',
  
  // Driver status
  active: 'Actif',
  available: 'Disponible',
  busy: 'Occupé',
  offline: 'Hors ligne',
  online: 'En ligne',
  in_delivery: 'En livraison',
  on_break: 'En pause',
  
  // Route status
  in_progress: 'En cours',
  completed: 'Terminé'
};

// Priority translations
export const PRIORITY_TRANSLATIONS = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente'
};

// Package type translations
export const PACKAGE_TYPE_TRANSLATIONS = {
  document: 'Document',
  colis: 'Colis',
  nourriture: 'Nourriture',
  fragile: 'Fragile',
  other: 'Autre'
};

// Helper functions
export const translateStatus = (status) => {
  return STATUS_TRANSLATIONS[status] || status;
};

export const translatePriority = (priority) => {
  return PRIORITY_TRANSLATIONS[priority] || priority;
};

export const translatePackageType = (type) => {
  return PACKAGE_TYPE_TRANSLATIONS[type] || type;
};

// Status colors
export const getStatusColor = (status) => {
  const colors = {
    // Package status
    pending: '#f59e0b',
    collected: '#3b82f6',
    in_transit: '#8b5cf6',
    in_delivery: '#06b6d4',
    delivered: '#10b981',
    delivery_failed: '#ef4444',
    cancelled: '#6b7280',
    
    // Driver status
    active: '#10b981',
    available: '#3b82f6',
    busy: '#f59e0b',
    offline: '#6b7280',
    online: '#10b981',
    on_break: '#f59e0b'
  };
  
  return colors[status] || '#6b7280';
};

// Status icons
export const getStatusIcon = (status) => {
  const icons = {
    // Package status
    pending: '⏳',
    collected: '📦',
    in_transit: '🚚',
    in_delivery: '🚗',
    delivered: '✅',
    delivery_failed: '❌',
    cancelled: '🚫',
    
    // Driver status
    active: '🟢',
    available: '🔵',
    busy: '🟡',
    offline: '⚫',
    online: '🟢',
    on_break: '🟠'
  };
  
  return icons[status] || '📌';
};
