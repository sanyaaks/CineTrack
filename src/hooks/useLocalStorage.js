import { useEffect, useRef, useState } from 'react';

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    // Ignore corrupted data of the wrong shape (e.g. an object where we expect an array).
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Works like useState, but the value is saved in localStorage and
 * restored on the next visit. Changes made in another tab are synced too.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));
  const initialRef = useRef(initialValue);

  // Save every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be full or disabled (private mode) – the app still works in memory.
    }
  }, [key, value]);

  // The "storage" event fires when another tab changes the same key.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === key) setValue(readValue(key, initialRef.current));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [value, setValue];
}
