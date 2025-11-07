import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Auto-save hook with debouncing
export function useAutoSave<T>(
  key: string,
  data: T,
  delay: number = 1000
) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Error auto-saving ${key}:`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, data, delay]);
}
