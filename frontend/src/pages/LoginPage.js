/**
 * Login Page
 * User authentication page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🛵 BETEX EXPRESS</h1>
          <p>Plateforme de gestion de livraison</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Connexion</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Identifiants de démonstration */}
        {process.env.REACT_APP_DEMO_MODE === 'true' && (
          <div className="demo-credentials">
            <div className="demo-title">
              🎭 MODE DÉMONSTRATION
            </div>
            <div className="demo-accounts">
              <div className="demo-account">
                <div className="demo-account-header">
                  <span className="demo-icon">👨‍💼</span>
                  <strong>Administrateur</strong>
                </div>
                <div className="demo-account-info">
                  <p>📧 admin@betex.com</p>
                  <p>🔑 admin123</p>
                </div>
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => {
                    setEmail('admin@betex.com');
                    setPassword('admin123');
                  }}
                >
                  Remplir
                </button>
              </div>
              
              <div className="demo-account">
                <div className="demo-account-header">
                  <span className="demo-icon">🚗</span>
                  <strong>Livreur</strong>
                </div>
                <div className="demo-account-info">
                  <p>📧 livreur@betex.com</p>
                  <p>🔑 livreur123</p>
                </div>
                <button
                  type="button"
                  className="btn-demo"
                  onClick={() => {
                    setEmail('livreur@betex.com');
                    setPassword('livreur123');
                  }}
                >
                  Remplir
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>© 2024 BETEX EXPRESS - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
