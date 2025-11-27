import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for automatic form data persistence to localStorage
 * @param {string} storageKey - Unique localStorage key for this form
 * @param {Object} formData - Object containing all form fields to save
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 * @returns {Object} - { lastSaved, clearSavedData }
 */
function useAutosave(storageKey, formData, delay = 1000) {
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        setLastSaved(new Date(data.timestamp));
      }
    } catch (error) {
      console.error(`Error loading saved data from ${storageKey}:`, error);
    }
  }, [storageKey]);

  // Autosave effect with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const dataToSave = {
          ...formData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        setLastSaved(new Date());
      } catch (error) {
        console.error(`Error saving data to ${storageKey}:`, error);
      }
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [storageKey, formData, delay]);

  // Clear saved data function
  const clearSavedData = () => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
    } catch (error) {
      console.error(`Error clearing saved data from ${storageKey}:`, error);
    }
  };

  // Get saved data function
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error(`Error loading saved data from ${storageKey}:`, error);
      return null;
    }
  };

  return { lastSaved, clearSavedData, getSavedData };
}

export default useAutosave;
