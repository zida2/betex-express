/**
 * Registration Page - Professional Design
 * Self-registration for new clients
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'client'
      };

      const user = await register(userData);
      setSuccessMessage('✅ Inscription réussie ! Redirection en cours...');
      
      setTimeout(() => {
        navigate('/client');
      }, 2500);
    } catch (err) {
      const errorMessage = err.message || 'L\'inscription a échoué. Veuillez réessayer.';
      setErrors({ submit: errorMessage });
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

      <div className="auth-container" style={{ maxWidth: '520px' }}>
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
                {/* Package Box - 3D */}
                <defs>
                  <linearGradient id="packageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c5282"/>
                    <stop offset="100%" stopColor="#1a365d"/>
                  </linearGradient>
                </defs>
                <rect x="-25" y="-35" width="50" height="40" rx="6" fill="url(#packageGrad)"/>
                <rect x="-23" y="-33" width="46" height="3" rx="1.5" fill="#3a669a"/>
                <rect x="-15" y="-30" width="30" height="3" rx="1.5" fill="#ff6b35"/>
                <rect x="-15" y="-20" width="30" height="3" rx="1.5" fill="#ff6b35"/>
                <rect x="25" y="-35" width="8" height="40" fill="#0f2443" transform="skewY(20)"/>
                
                {/* Delivery Vehicle - Scooter 3D */}
                <defs>
                  <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c5282"/>
                    <stop offset="100%" stopColor="#1a365d"/>
                  </linearGradient>
                </defs>
                <circle cx="-20" cy="25" r="16" fill="url(#wheelGrad)" stroke="#0f2443" strokeWidth="3"/>
                <circle cx="-20" cy="25" r="10" fill="none" stroke="#3a669a" strokeWidth="2"/>
                <circle cx="20" cy="25" r="16" fill="url(#wheelGrad)" stroke="#0f2443" strokeWidth="3"/>
                <circle cx="20" cy="25" r="10" fill="none" stroke="#3a669a" strokeWidth="2"/>
                <path d="M-20 25 L-20 10 L0 5 L20 10 L20 25" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <path d="M-20 25 L-20 10 L0 5 L20 10 L20 25" stroke="#3a669a" strokeWidth="4" fill="none" strokeLinecap="round"/>
                
                {/* Rider 3D */}
                <defs>
                  <linearGradient id="riderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c5282"/>
                    <stop offset="100%" stopColor="#1a365d"/>
                  </linearGradient>
                </defs>
                <circle cx="0" cy="-10" r="10" fill="url(#riderGrad)"/>
                <path d="M0 0 L0 10" stroke="#1a365d" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <path d="M0 0 L0 10" stroke="#3a669a" strokeWidth="4" fill="none" strokeLinecap="round"/>
                <path d="M0 2 L-12 12" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
                <path d="M0 10 L-15 25" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
                <path d="M0 10 L15 25" stroke="#1a365d" strokeWidth="7" fill="none" strokeLinecap="round"/>
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
          <p className="auth-subtitle" style={{ marginTop: '10px', color: '#e2e8f0' }}>Créer votre compte client</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="message message-success">
            <span className="message-icon">✓</span>
            {successMessage}
          </div>
        )}

        {/* Submit Error Message */}
        {errors.submit && (
          <div className="message message-error">
            <span className="message-icon">✕</span>
            {errors.submit}
          </div>
        )}

        {!successMessage && (
          <>
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setErrors(prev => ({ ...prev, firstName: '' }))}
                      placeholder="Jean"
                      disabled={loading}
                      className={errors.firstName ? 'error' : ''}
                    />
                  </div>
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">👥</span>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setErrors(prev => ({ ...prev, lastName: '' }))}
                      placeholder="Kouassi"
                      disabled={loading}
                      className={errors.lastName ? 'error' : ''}
                    />
                  </div>
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setErrors(prev => ({ ...prev, email: '' }))}
                    placeholder="votre@email.com"
                    disabled={loading}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Numéro de téléphone</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setErrors(prev => ({ ...prev, phone: '' }))}
                    placeholder="+226 XX XX XX XX"
                    disabled={loading}
                    className={errors.phone ? 'error' : ''}
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setErrors(prev => ({ ...prev, password: '' }))}
                    placeholder="••••••••"
                    disabled={loading}
                    className={errors.password ? 'error' : ''}
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
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setErrors(prev => ({ ...prev, confirmPassword: '' }))}
                    placeholder="••••••••"
                    disabled={loading}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button 
                type="submit" 
                className="btn-primary betex-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Inscription...</span>
                  </>
                ) : (
                  <span>Créer mon compte</span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="auth-links">
              <p className="auth-link-text">Vous avez déjà un compte ?</p>
              <Link to="/login" className="auth-link betex-link">
                Se connecter
              </Link>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <p>© 2026 BETEX EXPRESS</p>
          <p>Plateforme de gestion de livraison - Ouagadougou, Burkina Faso</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
