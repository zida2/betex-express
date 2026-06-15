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
            <svg viewBox="0 0 240 250" className="betex-logo">
              {/* White Rounded Background */}
              <circle cx="120" cy="125" r="115" fill="white"/>
              
              {/* Motion Lines Behind (to the left) */}
              <path d="M50 165 Q60 171 70 165" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              <path d="M40 158 Q50 164 60 158" stroke="#ff6b35" strokeWidth="2" fill="none" opacity="0.5"/>
              
              {/* Modern Delivery Icon */}
              <g transform="translate(120, 100)">
                {/* Package Box */}
                <rect x="-25" y="-35" width="50" height="40" rx="6" fill="#1a365d"/>
                <rect x="-15" y="-30" width="30" height="3" rx="1.5" fill="#ff6b35"/>
                <rect x="-15" y="-20" width="30" height="3" rx="1.5" fill="#ff6b35"/>
                
                {/* Delivery Vehicle - Scooter */}
                <circle cx="-20" cy="25" r="16" fill="none" stroke="#1a365d" strokeWidth="5"/>
                <circle cx="20" cy="25" r="16" fill="none" stroke="#1a365d" strokeWidth="5"/>
                <path d="M-20 25 L-20 10 L0 5 L20 10 L20 25" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
                
                {/* Rider */}
                <circle cx="0" cy="-10" r="10" fill="#1a365d"/>
                <path d="M0 0 L0 10" stroke="#1a365d" strokeWidth="6" fill="none" strokeLinecap="round"/>
                <path d="M0 2 L-12 12" stroke="#1a365d" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M0 10 L-15 25" stroke="#1a365d" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M0 10 L15 25" stroke="#1a365d" strokeWidth="5" fill="none" strokeLinecap="round"/>
              </g>
              
              {/* Text: Betex Express */}
              <text x="120" y="190" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">
                <tspan fill="#1a365d">Betex</tspan>
                <tspan fill="#ff6b35">Express</tspan>
              </text>
              
              {/* Text: Livraison - Coursiers */}
              <text x="120" y="215" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fill="#666">
                Livraison - Coursiers
              </text>
            </svg>
          </div>
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
