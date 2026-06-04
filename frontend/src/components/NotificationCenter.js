/**
 * Notification Center Component
 * Displays real-time notifications
 */

import React, { useState, useEffect } from 'react';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simuler des notifications en mode démo
    const demoNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Livraison terminée',
        message: 'Jean Kouassi a livré le colis BX2024002',
        time: new Date(Date.now() - 300000),
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Nouveau colis',
        message: 'Un nouveau colis BX2024005 a été créé',
        time: new Date(Date.now() - 600000),
        read: false
      },
      {
        id: 3,
        type: 'warning',
        title: 'Retard signalé',
        message: 'Yao Emmanuel signale un retard de 15 min',
        time: new Date(Date.now() - 1200000),
        read: true
      },
      {
        id: 4,
        type: 'success',
        title: 'Livreur disponible',
        message: 'Koné Abdoulaye est maintenant disponible',
        time: new Date(Date.now() - 1800000),
        read: true
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || 'ℹ️';
  };

  const getTimeAgo = (time) => {
    const diff = Date.now() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-read">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''} type-${notif.type}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notification-icon">{getIcon(notif.type)}</div>
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-time">{getTimeAgo(notif.time)}</span>
                  </div>
                  {!notif.read && <div className="notification-dot"></div>}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button className="btn-see-all">Voir toutes les notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
