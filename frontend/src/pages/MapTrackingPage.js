/**
 * Map Tracking Page
 * Real-time GPS tracking of drivers on map
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { translateStatus } from '../utils/translations';
import 'leaflet/dist/leaflet.css';
import '../styles/MapTrackingPage.css';

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
      
      const driversData = driversResponse.data.data?.drivers || driversResponse.data.data || [];
      const packagesData = packagesResponse.data.data || packagesResponse.data || [];
      
      setDrivers(driversData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to load map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDriverIcon = (status, name) => {
    const colors = {
      active: '#10b981',
      available: '#3b82f6',
      busy: '#f59e0b',
      offline: '#6b7280'
    };
    
    const color = colors[status] || colors.offline;
    
    // Utiliser des icônes Leaflet par défaut avec couleur et nom
    return new L.DivIcon({
      className: 'custom-driver-icon',
      html: `<div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
        <div style="
          margin-top: 4px;
          padding: 2px 6px;
          background-color: rgba(0, 0, 0, 0.75);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${name}</div>
      </div>`,
      iconSize: [100, 60],
      iconAnchor: [50, 32],
      popupAnchor: [0, -32]
    });
  };

  const getPackageIcon = () => {
    return new L.DivIcon({
      className: 'custom-package-icon',
      html: `<div style="
        width: 28px;
        height: 28px;
        background-color: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">📦</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    });
  };

  if (loading) {
    return <div className="loading">Chargement de la carte...</div>;
  }

  return (
    <div className="map-tracking-page">
      <header className="map-header">
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

      <div className="map-content">
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
                  onClick={() => setSelectedDriver(driver)}
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

          <div className="map-legend">
            <h4>Légende</h4>
            <div className="legend-item">
              <span className="legend-icon" style={{background: '#10b981'}}>🚗</span>
              <span>Livreur actif</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon" style={{background: '#3b82f6'}}>🚗</span>
              <span>Livreur disponible</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon" style={{background: '#ef4444'}}>📦</span>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Driver markers */}
            {drivers.map((driver) => (
              driver.currentLat && driver.currentLng && (
                <Marker
                  key={`driver-${driver.id}`}
                  position={[driver.currentLat, driver.currentLng]}
                  icon={getDriverIcon(driver.status, driver.name)}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>🚗 {driver.name}</h4>
                      <p><strong>Statut:</strong> {translateStatus(driver.status)}</p>
                      <p><strong>Colis:</strong> {driver.assignedPackages || 0}</p>
                      <p><strong>Complétés:</strong> {driver.completedToday || 0} aujourd'hui</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Package destination markers */}
            {packages.map((pkg) => (
              pkg.receiverLat && pkg.receiverLng && (
                <Marker
                  key={`package-${pkg.id}`}
                  position={[pkg.receiverLat, pkg.receiverLng]}
                  icon={getPackageIcon()}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>📦 {pkg.trackingNumber}</h4>
                      <p><strong>Destinataire:</strong> {pkg.receiverName}</p>
                      <p><strong>Adresse:</strong> {pkg.receiverAddress}</p>
                      <p><strong>Statut:</strong> {translateStatus(pkg.status)}</p>
                      {pkg.assignedDriver && (
                        <p><strong>Livreur:</strong> {pkg.assignedDriver.name}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapTrackingPage;
