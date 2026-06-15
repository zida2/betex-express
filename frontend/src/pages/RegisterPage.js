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
          <p className="auth-subtitle">Créer votre compte client</p>
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
