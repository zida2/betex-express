/**
 * Login Page
 * User authentication page
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
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
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

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-page">
      {/* Animated background */}
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
          <p className="login-subtitle">Plateforme de gestion de livraison intelligente</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Adresse email
            </label>
            <div className="input-wrapper">
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
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Mot de passe
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        {process.env.REACT_APP_DEMO_MODE === 'true' && (
          <div className="demo-section">
            <div className="demo-header">
              <div className="demo-badge">🎭 MODE DÉMO</div>
              <p className="demo-description">Utilisez ces comptes pour tester l'application</p>
            </div>
            
            <div className="demo-accounts">
              <div className="demo-card admin-card">
                <div className="card-ribbon">Admin</div>
                <div className="card-content">
                  <div className="card-icon">👨‍💼</div>
                  <h3>Administrateur</h3>
                  <div className="credentials">
                    <div className="credential-item">
                      <span className="cred-label">Email</span>
                      <code>admin@betex.com</code>
                    </div>
                    <div className="credential-item">
                      <span className="cred-label">Mot de passe</span>
                      <code>admin123</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-quick-login"
                    onClick={() => handleDemoLogin('admin@betex.com', 'admin123')}
                  >
                    <span>Connexion rapide</span>
                    <span className="btn-icon">⚡</span>
                  </button>
                </div>
              </div>
              
              <div className="demo-card driver-card">
                <div className="card-ribbon">Livreur</div>
                <div className="card-content">
                  <div className="card-icon">🚗</div>
                  <h3>Livreur</h3>
                  <div className="credentials">
                    <div className="credential-item">
                      <span className="cred-label">Email</span>
                      <code>livreur@betex.com</code>
                    </div>
                    <div className="credential-item">
                      <span className="cred-label">Mot de passe</span>
                      <code>livreur123</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-quick-login"
                    onClick={() => handleDemoLogin('livreur@betex.com', 'livreur123')}
                  >
                    <span>Connexion rapide</span>
                    <span className="btn-icon">⚡</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 BETEX EXPRESS - Ouagadougou, Burkina Faso</p>
          <p className="footer-tagline">Livraison rapide et fiable 🚀</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
