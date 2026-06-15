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
              {/* White Rounded Background with 3D shadow */}
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#f0f0f0"/>
                </linearGradient>
                <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <circle cx="120" cy="125" r="115" fill="url(#bgGrad)" filter="url(#logoShadow)"/>
              
              {/* Motion Lines Behind (to the left) */}
              <path d="M50 165 Q60 171 70 165" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              <path d="M40 158 Q50 164 60 158" stroke="#ff6b35" strokeWidth="2" fill="none" opacity="0.5"/>
              
              {/* Modern Delivery Icon */}
              <g transform="translate(120, 100)">
                {/* Package Box - 3D (Bigger and more visible) */}
                <defs>
                  <linearGradient id="packageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff8a5c"/>
                    <stop offset="100%" stopColor="#ff6b35"/>
                  </linearGradient>
                  <linearGradient id="packageSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b35"/>
                    <stop offset="100%" stopColor="#cc5529"/>
                  </linearGradient>
                </defs>
                <rect x="-30" y="-45" width="60" height="50" rx="8" fill="url(#packageGrad)"/>
                <rect x="-28" y="-43" width="56" height="4" rx="2" fill="#ffaa80"/>
                <rect x="-25" y="-35" width="50" height="4" rx="2" fill="#1a365d"/>
                <rect x="-25" y="-20" width="50" height="4" rx="2" fill="#1a365d"/>
                <rect x="30" y="-45" width="12" height="50" fill="url(#packageSideGrad)" transform="skewY(20)"/>
                <line x1="0" y1="-45" x2="0" y2="5" stroke="#1a365d" strokeWidth="3"/>
                <line x1="-30" y1="-20" x2="30" y2="-20" stroke="#1a365d" strokeWidth="3"/>
                
                {/* Delivery Vehicle - Scooter 3D */}
                <defs>
                  <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c5282"/>
                    <stop offset="100%" stopColor="#1a365d"/>
                  </linearGradient>
                </defs>
                <circle cx="-20" cy="30" r="16" fill="url(#wheelGrad)" stroke="#0f2443" strokeWidth="3"/>
                <circle cx="-20" cy="30" r="10" fill="none" stroke="#3a669a" strokeWidth="2"/>
                <circle cx="20" cy="30" r="16" fill="url(#wheelGrad)" stroke="#0f2443" strokeWidth="3"/>
                <circle cx="20" cy="30" r="10" fill="none" stroke="#3a669a" strokeWidth="2"/>
                <path d="M-20 30 L-20 15 L0 10 L20 15 L20 30" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <path d="M-20 30 L-20 15 L0 10 L20 15 L20 30" stroke="#3a669a" strokeWidth="4" fill="none" strokeLinecap="round"/>
                
                {/* Rider 3D */}
                <defs>
                  <linearGradient id="riderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c5282"/>
                    <stop offset="100%" stopColor="#1a365d"/>
                  </linearGradient>
                </defs>
                <circle cx="0" cy="-5" r="10" fill="url(#riderGrad)"/>
                <path d="M0 5 L0 15" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <path d="M0 5 L0 15" stroke="#3a669a" strokeWidth="4" fill="none" strokeLinecap="round"/>
                <path d="M0 7 L-12 17" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
                <path d="M0 15 L-15 30" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
                <path d="M0 15 L15 30" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
              </g>
              
              {/* Text: Betex Express - 3D */}
              <defs>
                <linearGradient id="betexGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2c5282"/>
                  <stop offset="100%" stopColor="#1a365d"/>
                </linearGradient>
                <linearGradient id="expressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff8a5c"/>
                  <stop offset="100%" stopColor="#ff6b35"/>
                </linearGradient>
                <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.25"/>
                </filter>
              </defs>
              <text x="120" y="190" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" filter="url(#textShadow)">
                <tspan fill="url(#betexGrad)">Betex</tspan>
                <tspan fill="url(#expressGrad)">Express</tspan>
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
