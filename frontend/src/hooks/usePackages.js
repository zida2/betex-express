/**
 * usePackages Hook
 * Custom hook for managing packages with error handling and caching
 */

import { useState, useCallback, useEffect } from 'react';
import { getPackages, createPackage as createFirebasePackage, updatePackage as updateFirebasePackage, deletePackage as deleteFirebasePackage } from '../services/firebaseService';
import { validateForm, packageSchema } from '../utils/validation';
import { useToast } from '../components/Toast';

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { addToast } = useToast();

  // Load packages
  const loadPackages = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const packagesData = await getPackages();
      const newPackages = Array.isArray(packagesData) ? packagesData : [];
      
      if (reset) {
        setPackages(newPackages);
      } else {
        setPackages(prev => [...prev, ...newPackages]);
      }

      setPage(pageNum);
      setHasMore(false);
    } catch (err) {
      const message = err.message || 'Erreur lors du chargement des colis';
      setError(message);
      addToast(message, 'error');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Create package
  const createPackage = useCallback(async (formData) => {
    try {
      // Validate
      const validation = await validateForm(packageSchema, formData);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        addToast(firstError, 'error');
        return { success: false, errors: validation.errors };
      }

      setLoading(true);
      const data = await createFirebasePackage(validation.data);
      
      // Add to list
      setPackages(prev => [data, ...prev]);
      addToast('Colis créé avec succès', 'success');
      
      return { success: true, data };
    } catch (err) {
      const message = err.message || 'Erreur lors de la création du colis';
      addToast(message, 'error');
      console.error('Error creating package:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Update package
  const updatePackage = useCallback(async (id, formData) => {
    try {
      const validation = await validateForm(packageSchema, formData);
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        addToast(firstError, 'error');
        return { success: false, errors: validation.errors };
      }

      setLoading(true);
      const data = await updateFirebasePackage(id, validation.data);
      
      // Update in list
      setPackages(prev => 
        prev.map(pkg => pkg.id === id ? data : pkg)
      );
      addToast('Colis mis à jour avec succès', 'success');
      
      return { success: true, data };
    } catch (err) {
      const message = err.message || 'Erreur lors de la mise à jour';
      addToast(message, 'error');
      console.error('Error updating package:', err);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Delete package
  const deletePackage = useCallback(async (id) => {
    try {
      await deleteFirebasePackage(id);
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
      addToast('Colis supprimé avec succès', 'success');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Erreur lors de la suppression';
      addToast(message, 'error');
      console.error('Error deleting package:', err);
      return { success: false, error: message };
    }
  }, [addToast]);

  // Retry failed load
  const retry = useCallback(() => {
    loadPackages(1, true);
  }, [loadPackages]);

  // Load more
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPackages(page + 1);
    }
  }, [loading, hasMore, page, loadPackages]);

  // Initial load
  useEffect(() => {
    loadPackages(1, true);
  }, []);

  return {
    packages,
    loading,
    error,
    hasMore,
    loadPackages,
    createPackage,
    updatePackage,
    deletePackage,
    loadMore,
    retry
  };
};
