import React, { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { translateStatus } from '../utils/translations';

const MapContent = ({ drivers, packages, selectedDriver, driverHistory, onDriverSelect }) => {
  const map = useMap();
  const [historyLayer, setHistoryLayer] = useState(null);

  const getDriverIcon = (status, name) => {
    const colors = {
      active: '#10b981',
      available: '#3b82f6',
      busy: '#f59e0b',
      offline: '#6b7280'
    };

    const color = colors[status] || colors.offline;

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

  useEffect(() => {
    if (driverHistory && driverHistory.length >= 2) {
      const latlngs = driverHistory.map(pos => [
        parseFloat(pos.latitude),
        parseFloat(pos.longitude)
      ]);

      if (historyLayer) {
        map.removeLayer(historyLayer);
      }

      const polyline = new L.Polyline(latlngs, {
        color: '#10b981',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1
      });

      polyline.addTo(map);
      setHistoryLayer(polyline);

      // Ajouter des marqueurs pour debut et fin
      const startIcon = new L.DivIcon({
        html: '<div style="background: #10b981; border-radius: 50%; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const endIcon = new L.DivIcon({
        html: '<div style="background: #ef4444; border-radius: 50%; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      new L.Marker(latlngs[0], { icon: startIcon })
        .addTo(map)
        .bindPopup('<b>📍 Début du trajet</b>');

      new L.Marker(latlngs[latlngs.length - 1], { icon: endIcon })
        .addTo(map)
        .bindPopup('<b>📍 Fin du trajet</b>');

      // Ajuster la carte pour voir tout le trajet
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (historyLayer) {
      map.removeLayer(historyLayer);
      setHistoryLayer(null);
    }
  }, [driverHistory, map, historyLayer]);

  return (
    <>
      {/* Driver markers */}
      {drivers.map((driver) => (
        driver.currentLat && driver.currentLng && (
          <Marker
            key={`driver-${driver.id}`}
            position={[driver.currentLat, driver.currentLng]}
            icon={getDriverIcon(driver.status, driver.name)}
            eventHandlers={{
              click: () => onDriverSelect(driver)
            }}
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

      {/* Package markers */}
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
    </>
  );
};

export default MapContent;