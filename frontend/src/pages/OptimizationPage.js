/**
 * Optimization Page
 * Intelligent driver assignment and route optimization
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus, getStatusIcon } from '../utils/translations';
import '../styles/OptimizationPage.css';

const OptimizationPage = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [driversWorkload, setDriversWorkload] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggest');

  // Fetch data on mount
  useEffect(() => {
    fetchPackages();
    fetchDrivers();
    fetchDriversWorkload();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages');
      const data = response.data.data;
      const packagesList = Array.isArray(data) ? data : (data?.packages || []);
      console.log('📦 Packages loaded:', packagesList);
      setPackages(packagesList);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      const data = response.data.data;
      const driversList = Array.isArray(data) ? data : (data?.drivers || []);
      setDrivers(driversList);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    }
  };

  const fetchDriversWorkload = async () => {
    try {
      const response = await api.get('/optimization/workload');
      const data = response.data.data;
      const workloadList = Array.isArray(data) ? data : (data?.workload || []);
      console.log('💼 Workload loaded:', workloadList);
      setDriversWorkload(workloadList);
    } catch (error) {
      console.error('Error fetching drivers workload:', error);
      // En cas d'erreur, on crée une workload par défaut basée sur les drivers
      setDriversWorkload([]);
    }
  };

  const handlePackageSelect = (packageId) => {
    setSelectedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSuggestDriver = async (packageId) => {
    setLoading(true);
    try {
      const response = await api.get(`/optimization/suggest-driver/${packageId}`);
      setSuggestions(prev => ({
        ...prev,
        [packageId]: response.data.data?.suggestedDriver
      }));
    } catch (error) {
      console.error('Error suggesting driver:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizePackages = async () => {
    if (selectedPackages.length === 0) {
      alert('Veuillez sélectionner au moins un colis');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/optimization/assign-packages', {
        packageIds: selectedPackages,
        zoneId: null
      });

      alert(`${response.data.data.length} colis optimisés et assignés`);
      setSuggestions({});
      setSelectedPackages([]);
      fetchPackages();
      fetchDriversWorkload();
    } catch (error) {
      console.error('Error optimizing packages:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadPercentage = (workload) => {
    if (!driversWorkload || driversWorkload.length === 0) return 0;
    const maxPackages = Math.max(...driversWorkload.map(w => w.assignedPackages || 0), 1);
    return ((workload.assignedPackages || 0) / maxPackages) * 100;
  };

  return (
    <div className="optimization-page">
      <div className="optimization-header">
        <h1>Optimisation des Livraisons</h1>
        <p>Assignation intelligente des colis aux livreurs</p>
      </div>

      <div className="optimization-container">
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'suggest' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggest')}
          >
            Suggérer Livreur
          </button>
          <button 
            className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimize')}
          >
            Optimiser Colis
          </button>
          <button 
            className={`tab ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            Charge de Travail
          </button>
        </div>

        {/* Suggest Driver Tab */}
        {activeTab === 'suggest' && (
          <div className="tab-content">
            <h2>Suggérer le meilleur livreur pour un colis</h2>
            <div className="packages-list">
              {packages.filter(pkg => pkg.status !== 'delivered').map(pkg => (
                <div key={pkg.id} className="package-card">
                  <div className="package-info">
                    <h4>📦 Colis #{pkg.trackingNumber}</h4>
                    <p><strong>Destinataire:</strong> {pkg.customerName || pkg.receiverName}</p>
                    <p><strong>Adresse:</strong> {pkg.address || pkg.receiverAddress}</p>
                    <p><strong>Statut:</strong> <span className={`status-badge badge-${pkg.status}`}>{getStatusIcon(pkg.status)} {translateStatus(pkg.status)}</span></p>
                    {pkg.weight && <p><strong>Poids:</strong> {pkg.weight} kg</p>}
                  </div>
                  <div className="package-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSuggestDriver(pkg.id)}
                      disabled={loading}
                    >
                      🎯 Suggérer Livreur
                    </button>
                  </div>
                  {suggestions[pkg.id] && (
                    <div className="suggestion-result">
                      <h5>✓ Livreur Recommandé:</h5>
                      <p><strong>👤 Nom:</strong> {suggestions[pkg.id].name}</p>
                      <p><strong>📍 Distance:</strong> {suggestions[pkg.id].distance?.toFixed(2) || 'N/A'} km</p>
                      <p><strong>✅ Taux de Succès:</strong> {suggestions[pkg.id].successRate || 0}%</p>
                      <p><strong>📊 Statut:</strong> <span className={`status-badge badge-${suggestions[pkg.id].status}`}>{translateStatus(suggestions[pkg.id].status)}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimize Packages Tab */}
        {activeTab === 'optimize' && (
          <div className="tab-content">
            <h2>Optimiser l'assignation de plusieurs colis</h2>
            <div className="optimize-section">
              <div className="selection-info">
                <p><strong>{selectedPackages.length}</strong> colis sélectionnés</p>
                <button 
                  className="btn btn-success"
                  onClick={handleOptimizePackages}
                  disabled={selectedPackages.length === 0 || loading}
                >
                  {loading ? '⏳ Optimisation...' : '⚡ Optimiser et Assigner'}
                </button>
              </div>

              {packages.filter(pkg => pkg.status !== 'delivered').length === 0 ? (
                <div className="empty-packages">
                  <div className="empty-icon">📦</div>
                  <h3>Aucun colis à assigner</h3>
                  <p>Tous les colis ont été livrés ou assignés</p>
                </div>
              ) : (
                <div className="packages-grid">
                  {packages.filter(pkg => pkg.status !== 'delivered').map(pkg => (
                    <div 
                      key={pkg.id} 
                      className={`package-item ${selectedPackages.includes(pkg.id) ? 'selected' : ''}`}
                    >
                      <label className="package-checkbox-label">
                        <input 
                          type="checkbox" 
                          checked={selectedPackages.includes(pkg.id)}
                          onChange={() => handlePackageSelect(pkg.id)}
                        />
                        <div className="package-details">
                          <h4>📦 #{pkg.trackingNumber || pkg.id}</h4>
                          <p className="receiver-name"><strong>Destinataire:</strong> {pkg.receiverName || pkg.customerName || 'Non spécifié'}</p>
                          <p className="address"><strong>📍 Adresse:</strong> {pkg.receiverAddress || pkg.address || 'Non spécifiée'}</p>
                          {pkg.weight && <p className="weight"><strong>⚖️ Poids:</strong> {pkg.weight} kg</p>}
                          <span className={`status-badge badge-${pkg.status}`}>
                            {getStatusIcon(pkg.status)} {translateStatus(pkg.status)}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && (
          <div className="tab-content">
            <h2>Charge de Travail des Livreurs</h2>
            {driversWorkload.length === 0 ? (
              <div className="empty-packages">
                <div className="empty-icon">👨‍🚚</div>
                <h3>Aucune donnée disponible</h3>
                <p>La charge de travail des livreurs s'affichera ici</p>
              </div>
            ) : (
              <div className="workload-list">
                {driversWorkload.map(workload => (
                  <div key={workload.driverId} className="workload-card">
                    <div className="workload-header">
                      <h4>👤 {workload.driverName}</h4>
                      <span className={`status-badge badge-${workload.status}`}>
                        {translateStatus(workload.status)}
                      </span>
                    </div>
                    <div className="workload-stats">
                      <div className="stat">
                        <label>Colis Assignés:</label>
                        <strong>{workload.assignedPackages || 0}</strong>
                      </div>
                      <div className="stat">
                        <label>Poids Total:</label>
                        <strong>{workload.totalWeight || 0} kg</strong>
                      </div>
                      <div className="stat">
                        <label>Taux de Succès:</label>
                        <strong>{((workload.successRate || 0) * 100).toFixed(1)}%</strong>
                      </div>
                    </div>
                    <div className="workload-bar">
                      <div 
                        className="workload-fill"
                        style={{ width: `${getWorkloadPercentage(workload)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationPage;
