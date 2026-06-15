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
              {/* Wheels (Orange with Blue Center) */}
              <circle cx="100" cy="135" r="28" fill="none" stroke="#ff6b35" strokeWidth="8"/>
              <circle cx="100" cy="135" r="12" fill="#1a365d"/>
              <circle cx="160" cy="135" r="28" fill="none" stroke="#ff6b35" strokeWidth="8"/>
              <circle cx="160" cy="135" r="12" fill="#1a365d"/>
              
              {/* Motion Lines Under Wheels */}
              <path d="M75 150 Q85 156 95 150" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              <path d="M135 150 Q145 156 155 150" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              
              {/* Rider Head */}
              <circle cx="130" cy="55" r="18" fill="#1a365d"/>
              
              {/* Rider Cap */}
              <path d="M115 45 L130 38 L145 45" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
              
              {/* Rider Body and Pose */}
              <path d="M130 73 L130 100" stroke="#1a365d" strokeWidth="10" fill="none" strokeLinecap="round"/>
              
              {/* Rider Right Arm (holding box) */}
              <path d="M130 78 L165 75" stroke="#1a365d" strokeWidth="9" fill="none" strokeLinecap="round"/>
              
              {/* Rider Left Arm */}
              <path d="M130 82 L110 95" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
              
              {/* Rider Right Leg (forward) */}
              <path d="M130 100 L150 130" stroke="#1a365d" strokeWidth="9" fill="none" strokeLinecap="round"/>
              
              {/* Rider Left Leg (back) */}
              <path d="M130 100 L110 120" stroke="#1a365d" strokeWidth="9" fill="none" strokeLinecap="round"/>
              
              {/* Rider's Feet on Wheels */}
              <circle cx="150" cy="132" r="7" fill="#1a365d"/>
              <circle cx="110" cy="122" r="7" fill="#1a365d"/>
              
              {/* Delivery Box */}
              <rect x="168" y="60" width="45" height="40" rx="4" fill="#1a365d"/>
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
