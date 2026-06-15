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
