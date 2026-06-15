/**
 * Map Tracking Page
 * Real-time GPS tracking of drivers on map
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import '../styles/MapTrackingPage.css';
import '../styles/PageLayout.css';
import MapContent from '../components/MapContent';

// Fix Leaflet default icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const MapTrackingPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverHistory, setDriverHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Center map on Ouagadougou, Burkina Faso
  const mapCenter = [12.3714, -1.5197];

  useEffect(() => {
    loadMapData();

    // Refresh every 30 seconds
    const interval = setInterval(loadMapData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    try {
      const [driversResponse, packagesResponse] = await Promise.all([
        api.get('/drivers'),
        api.get('/packages', { params: { status: 'in_transit,in_delivery' } })
      ]);

      // Handle both array and object with drivers property
      const driversData = Array.isArray(driversResponse.data.data)
        ? driversResponse.data.data
        : (driversResponse.data.data?.drivers || []);

      // Handle packages data properly
      const packagesData = Array.isArray(packagesResponse.data.data)
        ? packagesResponse.data.data
        : (packagesResponse.data.data?.packages || []);

      setDrivers(driversData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to load map data:', error);
      setDrivers([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverHistory = async (driverId) => {
    try {
      const response = await api.get(`/gps/driver/${driverId}/history`, {
        params: { limit: 100 }
      });
      const positions = response.data.data?.positions || [];
      setDriverHistory(positions.reverse()); // Inverser pour avoir du plus ancien au plus recent
    } catch (error) {
      console.error('Failed to load driver history:', error);
      setDriverHistory([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement de la carte...</div>;
  }

  return (
    <div className="page-layout map-tracking-page">
      <header className="page-header map-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
            ← Retour
          </button>
          <h1>🗺️ Carte GPS</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <div className="page-content map-content">
        <button className="btn-toggle-info" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰ Info
        </button>
        <aside className={`map-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
          <div className="sidebar-section">
            <h3>🚗 Livreurs ({drivers.length})</h3>
            <div className="drivers-list">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`driver-item ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedDriver(driver);
                    loadDriverHistory(driver.id);
                  }}
                >
                  <div className="driver-info">
                    <span className={`driver-status status-${driver.status}`}></span>
                    <div>
                      <strong>{driver.name}</strong>
                      <p>{driver.assignedPackages || 0} colis</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>📦 Colis en cours ({packages.length})</h3>
            <div className="packages-list">
              {packages.length === 0 ? (
                <p className="empty-message">Aucun colis en livraison</p>
              ) : (
                packages.map((pkg) => (
                  <div key={pkg.id} className="package-item">
                    <div className="package-header">
                      <strong>{pkg.trackingNumber}</strong>
                      <span className={`badge badge-${pkg.status}`}>{pkg.status}</span>
                    </div>
                    <p className="package-receiver">{pkg.receiverName}</p>
                    {pkg.assignedDriver && (
                      <p className="package-driver">👤 {pkg.assignedDriver.name}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Historique du trajet si un livreur est selectionne */}
          {selectedDriver && (
            <div className="sidebar-section">
              <h3>📊 Trajet de {selectedDriver.name}</h3>
              <div className="route-history">
                {driverHistory.length === 0 ? (
                  <p className="empty-message">Aucun historique de trajet disponible</p>
                ) : (
                  <>
                    <div className="history-summary">
                      <p><strong>{driverHistory.length}</strong> points enregistres</p>
                      {driverHistory[0]?.recordedAt && (
                        <p className="history-time">
                          Début : {new Date(driverHistory[0].recordedAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                      {driverHistory[driverHistory.length - 1]?.recordedAt && (
                        <p className="history-time">
                          Fin : {new Date(driverHistory[driverHistory.length - 1].recordedAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="map-legend">
            <h4>Légende</h4>
            <div className="legend-item">
              <span className="legend-icon" style={{ background: '#10b981' }}>🚗</span>
              <span>Livreur actif</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon" style={{ background: '#3b82f6' }}>🚗</span>
              <span>Livreur disponible</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon" style={{ background: '#10b981', border: '2px dashed' }}></span>
              <span>Trajet historique</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon" style={{ background: '#ef4444' }}>📦</span>
              <span>Destination</span>
            </div>
          </div>
        </aside>

        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OpenStreetMap&lt;/a&gt;'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <MapContent
              drivers={drivers}
              packages={packages}
              selectedDriver={selectedDriver}
              driverHistory={driverHistory}
              onDriverSelect={(driver) => {
                setSelectedDriver(driver);
                loadDriverHistory(driver.id);
              }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapTrackingPage;