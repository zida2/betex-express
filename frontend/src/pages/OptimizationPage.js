/**
 * Optimization Page
 * Intelligent driver assignment and route optimization
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/OptimizationPage.css';
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
      setDriversWorkload(workloadList);
    } catch (error) {
      console.error('Error fetching drivers workload:', error);
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
    const maxPackages = Math.max(...driversWorkload.map(w => w.assignedPackages), 1);
    return (workload.assignedPackages / maxPackages) * 100;
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
                    <h4>Colis #{pkg.trackingNumber}</h4>
                    <p><strong>Destinataire:</strong> {pkg.recipientName}</p>
                    <p><strong>Adresse:</strong> {pkg.recipientAddress}</p>
                    <p><strong>Statut:</strong> <span className={`status ${pkg.status}`}>{pkg.status}</span></p>
                    <p><strong>Poids:</strong> {pkg.weight} kg</p>
                  </div>
                  <div className="package-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSuggestDriver(pkg.id)}
                      disabled={loading}
                    >
                      Suggérer Livreur
                    </button>
                  </div>
                  {suggestions[pkg.id] && (
                    <div className="suggestion-result">
                      <h5>✓ Livreur Suggéré:</h5>
                      <p><strong>Nom:</strong> {suggestions[pkg.id].name}</p>
                      <p><strong>Distance:</strong> {suggestions[pkg.id].distance} km</p>
                      <p><strong>Taux de Succès:</strong> {suggestions[pkg.id].successRate}%</p>
                      <p><strong>Statut:</strong> {suggestions[pkg.id].status}</p>
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
                <p>{selectedPackages.length} colis sélectionnés</p>
                <button 
                  className="btn btn-success"
                  onClick={handleOptimizePackages}
                  disabled={selectedPackages.length === 0 || loading}
                >
                  {loading ? 'Optimisation...' : 'Optimiser et Assigner'}
                </button>
              </div>

              <div className="packages-grid">
                {packages.filter(pkg => pkg.status !== 'delivered').map(pkg => (
                  <div 
                    key={pkg.id} 
                    className={`package-item ${selectedPackages.includes(pkg.id) ? 'selected' : ''}`}
                    onClick={() => handlePackageSelect(pkg.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={() => handlePackageSelect(pkg.id)}
                    />
                    <div className="package-details">
                      <h4>#{pkg.trackingNumber}</h4>
                      <p>{pkg.recipientName}</p>
                      <p className="address">{pkg.recipientAddress}</p>
                      <span className={`status ${pkg.status}`}>{pkg.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && (
          <div className="tab-content">
            <h2>Charge de Travail des Livreurs</h2>
            <div className="workload-list">
              {driversWorkload.map(workload => (
                <div key={workload.driverId} className="workload-card">
                  <div className="workload-header">
                    <h4>{workload.driverName}</h4>
                    <span className={`status ${workload.status}`}>{workload.status}</span>
                  </div>
                  <div className="workload-stats">
                    <div className="stat">
                      <label>Colis Assignés:</label>
                      <strong>{workload.assignedPackages}</strong>
                    </div>
                    <div className="stat">
                      <label>Poids Total:</label>
                      <strong>{workload.totalWeight} kg</strong>
                    </div>
                    <div className="stat">
                      <label>Taux de Succès:</label>
                      <strong>{(workload.successRate * 100).toFixed(1)}%</strong>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizationPage;
