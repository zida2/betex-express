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
              {/* White Background Circle */}
              <circle cx="120" cy="125" r="110" fill="white"/>
              
              {/* Icon Group */}
              <g transform="translate(120, 110)">
                {/* Wheels (Orange with Blue Center) */}
                <circle cx="-35" cy="25" r="22" fill="#ff6b35"/>
                <circle cx="-35" cy="25" r="10" fill="#1a365d"/>
                <circle cx="35" cy="25" r="22" fill="#ff6b35"/>
                <circle cx="35" cy="25" r="10" fill="#1a365d"/>
                
                {/* Motion Lines Under Wheels */}
                <path d="M-55 48 Q-35 55 -15 48" stroke="#ff6b35" strokeWidth="3" fill="none"/>
                <path d="M15 48 Q35 55 55 48" stroke="#ff6b35" strokeWidth="3" fill="none"/>
                
                {/* Rider and Scooter Body */}
                <g fill="#1a365d">
                  {/* Rider Head */}
                  <circle cx="0" cy="-25" r="12"/>
                  {/* Rider Cap */}
                  <ellipse cx="0" cy="-35" rx="14" ry="5"/>
                  <rect x="-8" y="-40" width="16" height="5" rx="2"/>
                  
                  {/* Rider Body (torso) */}
                  <path d="M0 -13 L0 8" strokeWidth="10" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Rider Right Arm (holding package) */}
                  <path d="M5 -10 L35 -20" strokeWidth="9" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Rider Left Arm */}
                  <path d="M-5 -10 L-25 0" strokeWidth="8" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Rider Right Leg (forward) */}
                  <path d="M0 8 L25 25" strokeWidth="9" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Rider Left Leg (back) */}
                  <path d="M0 8 L-25 18" strokeWidth="9" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Scooter Frame */}
                  <path d="M-35 25 L-35 5 L0 0 L35 5 L35 25" strokeWidth="6" stroke="#1a365d" fill="none" strokeLinecap="round"/>
                  
                  {/* Package Box */}
                  <rect x="40" y="-40" width="35" height="30" rx="4"/>
                </g>
              </g>
              
              {/* Text: Betex Express */}
              <defs>
                <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15"/>
                </filter>
              </defs>
              <text x="120" y="195" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="26" fontWeight="bold" filter="url(#textShadow)">
                <tspan fill="#1a365d">Betex</tspan>
                <tspan fill="#ff6b35">Express</tspan>
              </text>
              
              {/* Text: Livraison - Coursiers */}
              <text x="120" y="220" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fill="#555">
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
