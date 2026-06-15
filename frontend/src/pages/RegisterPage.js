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
              {/* White Rounded Background */}
              <circle cx="120" cy="100" r="85" fill="white"/>
              
              {/* Motion Lines Behind (to the left) */}
              <path d="M45 150 Q55 156 65 150" stroke="#ff6b35" strokeWidth="3" fill="none" opacity="0.7"/>
              <path d="M35 143 Q45 149 55 143" stroke="#ff6b35" strokeWidth="2" fill="none" opacity="0.5"/>
              
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
