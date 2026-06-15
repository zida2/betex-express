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
            <svg viewBox="0 0 240 200" className="betex-logo">
              {/* Background Wheels (Orange) */}
              <circle cx="80" cy="130" r="35" fill="none" stroke="#ff6b35" strokeWidth="8"/>
              <circle cx="80" cy="130" r="22" fill="none" stroke="#ff6b35" strokeWidth="4"/>
              <circle cx="160" cy="130" r="35" fill="none" stroke="#ff6b35" strokeWidth="8"/>
              <circle cx="160" cy="130" r="22" fill="none" stroke="#ff6b35" strokeWidth="4"/>
              
              {/* Motorcycle Body */}
              <path d="M60 110 L120 80 L180 110 L170 140 L70 140 Z" fill="#1a365d"/>
              
              {/* Rider Head */}
              <circle cx="120" cy="55" r="18" fill="#1a365d"/>
              
              {/* Rider Body */}
              <path d="M120 73 L120 105" stroke="#1a365d" strokeWidth="10" fill="none" strokeLinecap="round"/>
              
              {/* Rider Arms */}
              <path d="M120 82 L100 95" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M120 82 L140 90" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              
              {/* Rider Legs */}
              <path d="M120 105 L100 130" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M120 105 L140 125" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              
              {/* Delivery Box */}
              <rect x="170" y="70" width="50" height="45" rx="6" fill="#1a365d" transform="rotate(-8 195 92.5)"/>
              
              {/* Motion Lines */}
              <path d="M30 135 Q45 142 60 135" stroke="#ff6b35" strokeWidth="4" fill="none" opacity="0.8"/>
              <path d="M20 128 Q35 135 50 128" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.6"/>
              <path d="M10 121 Q25 128 40 121" stroke="#ff6b35" strokeWidth="2" fill="none" opacity="0.4"/>
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
