/**
 * Login Page - SIMPLIFIED DEMO MODE
 * Simple and clean login page for demo mode
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'dispatcher') {
        navigate('/admin/dashboard');
      } else if (user.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin' || user.role === 'dispatcher') {
        navigate('/admin/dashboard');
      } else if (user.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="login-container">
        {/* Logo and Brand */}
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🛵</div>
          </div>
          <h1 className="login-title">BETEX EXPRESS</h1>
          <p className="login-subtitle">Plateforme de gestion de livraison</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Demo Mode - Quick Login Buttons */}
        {DEMO_MODE && (
          <div className="demo-quick-login">
            <p className="demo-label">🎭 Mode Démo - Connexion Rapide</p>
            <div className="quick-buttons">
              <button
                type="button"
                className="btn-quick-admin"
                onClick={() => handleQuickLogin('admin@betex.com', 'admin123')}
                disabled={loading}
              >
                <span className="btn-icon">👨‍💼</span>
                <span className="btn-text">Admin</span>
              </button>
              <button
                type="button"
                className="btn-quick-driver"
                onClick={() => handleQuickLogin('livreur@betex.com', 'livreur123')}
                disabled={loading}
              >
                <span className="btn-icon">🚗</span>
                <span className="btn-text">Livreur</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Login Form */}
        <div className="form-divider">
          <span>Ou connexion manuelle</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 BETEX EXPRESS - Ouagadougou, Burkina Faso</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
