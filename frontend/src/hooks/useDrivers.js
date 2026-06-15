/**
 * useDrivers Hook
 * Custom hook for managing drivers
 */

import { useState, useCallback, useEffect } from 'react';
import { getDrivers } from '../services/firebaseService';
import { useToast } from '../components/Toast';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const driversData = await getDrivers();
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (err) {
      const message = err.message || 'Erreur lors du chargement des chauffeurs';
      setError(message);
      addToast(message, 'error');
      console.error('Error loading drivers:', err);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const getAvailableDriver = useCallback(
    (senderLat, senderLng, receiverLat, receiverLng) => {
      if (!drivers.length) return null;

      // Calculate distance to each driver
      const driversWithDistance = drivers
        .filter(d => d.status === 'available')
        .map(driver => {
          const distance = calculateDistance(
            senderLat,
            senderLng,
            driver.currentLatitude,
            driver.currentLongitude
          );
          return { ...driver, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      return driversWithDistance[0] || null;
    },
    [drivers]
  );

  const retry = useCallback(() => {
    loadDrivers();
  }, [loadDrivers]);

  // Initial load
  useEffect(() => {
    loadDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    loadDrivers,
    getAvailableDriver,
    retry
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
