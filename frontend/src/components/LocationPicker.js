import React, { useState } from 'react';
import '../styles/LocationPicker.css';

const LocationPicker = ({ 
  onLocationSelect, 
  initialAddress = '', 
  initialLat = null, 
  initialLng = null,
  label = 'Sélectionner une localisation'
}) => {
  const [address, setAddress] = useState(initialAddress || '');
  const [latitude, setLatitude] = useState(initialLat ? String(initialLat) : '');
  const [longitude, setLongitude] = useState(initialLng ? String(initialLng) : '');
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setLatitude(String(lat));
          setLongitude(String(lng));
          setAddress(`Localisation actuelle: ${lat}, ${lng}`);
          onLocationSelect({
            address: `Localisation actuelle: ${lat}, ${lng}`,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
          });
          setLoading(false);
        },
        () => {
          alert('Impossible d\'accéder à votre localisation');
          setLoading(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée');
    }
  };

  const handleCoordinateChange = (type, value) => {
    if (type === 'lat') {
      setLatitude(value);
    } else {
      setLongitude(value);
    }

    const lat = type === 'lat' ? value : latitude;
    const lng = type === 'lng' ? value : longitude;
    
    if (lat && lng) {
      onLocationSelect({
        address: address || `${lat}, ${lng}`,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      });
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  return (
    <div className="location-picker">
      <label className="location-label">{label}</label>

      <div className="location-input-group">
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Entrez une adresse..."
          className="location-input"
        />
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="btn-location"
          title="Utiliser ma localisation actuelle"
        >
          📍
        </button>
      </div>

      <div className="coordinates-group">
        <div className="coordinate-input">
          <label>Latitude</label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => handleCoordinateChange('lat', e.target.value)}
            placeholder="Ex: 48.8566"
            step="0.0001"
          />
        </div>
        <div className="coordinate-input">
          <label>Longitude</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => handleCoordinateChange('lng', e.target.value)}
            placeholder="Ex: 2.3522"
            step="0.0001"
          />
        </div>
      </div>

      {latitude && longitude && (
        <div className="location-display">
          <strong>✓ Localisation sélectionnée:</strong>
          <div className="location-info">
            <span>📍 Lat: {latitude}, Lng: {longitude}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
