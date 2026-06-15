/**
 * Login Page - Professional Design
 * Clean, modern authentication interface
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Navigate based on role
      if (user.role === 'admin' || user.role === 'dispatcher') {
        navigate('/admin/dashboard');
      } else if (user.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (user.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.message || 'Connexion échouée. Veuillez vérifier vos identifiants.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 200 200" className="betex-logo">
              {/* Rider */}
              <circle cx="110" cy="80" r="15" fill="#1a365d" />
              <path d="M110 95 L110 130" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M110 105 L95 120" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M110 105 L125 115" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M110 130 L90 150" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M110 130 L130 145" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
              
              {/* Motorcycle body */}
              <path d="M80 135 L110 115 L140 135 L130 155 L90 155 Z" fill="#1a365d"/>
              
              {/* Wheels */}
              <circle cx="90" cy="155" r="25" fill="none" stroke="#ff6b35" strokeWidth="6"/>
              <circle cx="90" cy="155" r="15" fill="none" stroke="#ff6b35" strokeWidth="3"/>
              <circle cx="130" cy="155" r="25" fill="none" stroke="#ff6b35" strokeWidth="6"/>
              <circle cx="130" cy="155" r="15" fill="none" stroke="#ff6b35" strokeWidth="3"/>
              
              {/* Delivery box */}
              <rect x="135" y="100" width="40" height="40" rx="5" fill="#1a365d" transform="rotate(-10 155 120)"/>
              
              {/* Motion lines */}
              <path d="M60 160 Q70 165 80 160" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              <path d="M50 155 Q60 160 70 155" stroke="#ff6b35" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M40 150 Q50 155 60 150" stroke="#ff6b35" strokeWidth="1.5" fill="none" opacity="0.3"/>
            </svg>
          </div>
          <h1 className="auth-title">
            <span className="betex">Betex</span>
            <span className="express">Express</span>
          </h1>
          <p className="auth-subtitle">Livraison - Coursiers</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message message-error">
            <span className="message-icon">✕</span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setError('')}
                required
                placeholder="email@exemple.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔐</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setError('')}
                required
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary betex-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Connexion...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="auth-links">
          <p className="auth-link-text">Vous êtes nouveau client ?</p>
          <Link to="/register" className="auth-link betex-link">
            Créer un compte
          </Link>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>© 2026 Betex Express</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
