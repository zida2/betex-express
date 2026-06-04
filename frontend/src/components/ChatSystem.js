/**
 * Chat System Component  
 * Real-time communication between admin and drivers
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/ChatSystem.css';

const ChatSystem = ({ isOpen, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineDrivers, setOnlineDrivers] = useState([]);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadOnlineDrivers();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    // Simuler des conversations en mode démo
    const demoConversations = [
      {
        id: 1,
        driverId: 2,
        driverName: 'Jean Kouassi',
        lastMessage: 'Client absent, que faire ?',
        lastMessageTime: new Date(Date.now() - 300000),
        unreadCount: 2,
        status: 'active'
      },
      {
        id: 2,
        driverId: 3,
        driverName: 'Yao Emmanuel', 
        lastMessage: 'Livraison terminée !',
        lastMessageTime: new Date(Date.now() - 900000),
        unreadCount: 0,
        status: 'available'
      },
      {
        id: 3,
        driverId: 4,
        driverName: 'Koné Abdoulaye',
        lastMessage: 'Embouteillage sur ma route',
        lastMessageTime: new Date(Date.now() - 1200000),
        unreadCount: 1,
        status: 'busy'
      }
    ];
    setConversations(demoConversations);
  };

  const loadOnlineDrivers = async () => {
    const demoDrivers = [
      { id: 2, name: 'Jean Kouassi', status: 'active' },
      { id: 3, name: 'Yao Emmanuel', status: 'available' },
      { id: 4, name: 'Koné Abdoulaye', status: 'busy' }
    ];
    setOnlineDrivers(demoDrivers);
  };

  const loadMessages = (conversationId) => {
    // Simuler des messages
    const demoMessages = {
      1: [
        {
          id: 1,
          senderId: 2,
          senderName: 'Jean Kouassi',
          message: 'Bonjour, je suis arrivé chez le client',
          time: new Date(Date.now() - 900000),
          type: 'received'
        },
        {
          id: 2,
          senderId: 1,
          senderName: 'Admin',
          message: 'Parfait ! Tenez-moi au courant',
          time: new Date(Date.now() - 800000),
          type: 'sent'
        },
        {
          id: 3,
          senderId: 2,
          senderName: 'Jean Kouassi',
          message: 'Le client n\'est pas là. Dois-je attendre ?',
          time: new Date(Date.now() - 600000),
          type: 'received'
        },
        {
          id: 4,
          senderId: 2,
          senderName: 'Jean Kouassi',
          message: 'Client absent, que faire ?',
          time: new Date(Date.now() - 300000),
          type: 'received'
        }
      ],
      2: [
        {
          id: 5,
          senderId: 3,
          senderName: 'Yao Emmanuel',
          message: 'Colis BX2024003 livré avec succès !',
          time: new Date(Date.now() - 900000),
          type: 'received'
        },
        {
          id: 6,
          senderId: 1,
          senderName: 'Admin',
          message: 'Excellent travail ! 👍',
          time: new Date(Date.now() - 850000),
          type: 'sent'
        }
      ],
      3: [
        {
          id: 7,
          senderId: 4,
          senderName: 'Koné Abdoulaye',
          message: 'Embouteillage important sur la route. Retard estimé 20 min',
          time: new Date(Date.now() - 1200000),
          type: 'received'
        }
      ]
    };
    
    setMessages(demoMessages[conversationId] || []);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewChat = (driver) => {
    const existingConv = conversations.find(conv => conv.driverId === driver.id);
    if (existingConv) {
      setActiveChat(existingConv);
      loadMessages(existingConv.id);
    } else {
      const newConv = {
        id: Date.now(),
        driverId: driver.id,
        driverName: driver.name,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        status: driver.status
      };
      setConversations([newConv, ...conversations]);
      setActiveChat(newConv);
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: 'Admin',
      message: newMessage,
      time: new Date(),
      type: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Mettre à jour la conversation
    setConversations(conversations.map(conv => 
      conv.id === activeChat.id 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date() }
        : conv
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIconEmoji = (status) => {
    const icons = {
      active: '🟢',
      available: '🔵', 
      busy: '🟡',
      offline: '⚫'
    };
    return icons[status] || '⚫';
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 Messages</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <div className="chat-content">
          <div className="chat-sidebar">
            <div className="online-drivers">
              <h4>Livreurs en ligne</h4>
              <div className="drivers-list">
                {onlineDrivers.map(driver => (
                  <div 
                    key={driver.id} 
                    className="driver-item"
                    onClick={() => startNewChat(driver)}
                  >
                    <span className="driver-status">{getStatusIconEmoji(driver.status)}</span>
                    <span className="driver-name">{driver.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="conversations">
              <h4>Conversations</h4>
              <div className="conversations-list">
                {conversations.map(conv => (
                  <div 
                    key={conv.id}
                    className={`conversation-item ${activeChat?.id === conv.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChat(conv);
                      loadMessages(conv.id);
                    }}
                  >
                    <div className="conversation-header">
                      <span className="driver-status">{getStatusIconEmoji(conv.status)}</span>
                      <span className="driver-name">{conv.driverName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                    <div className="last-message">{conv.lastMessage}</div>
                    <div className="last-time">{formatTime(conv.lastMessageTime)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chat-main">
            {activeChat ? (
              <>
                <div className="chat-messages">
                  {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.type}`}>
                      <div className="message-content">
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">{formatTime(msg.time)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message à ${activeChat.driverName}...`}
                    rows="2"
                  />
                  <button onClick={sendMessage} disabled={!newMessage.trim()}>
                    Envoyer
                  </button>
                </div>
              </>
            ) : (
              <div className="no-chat">
                <p>Sélectionnez une conversation ou démarrez un nouveau chat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;