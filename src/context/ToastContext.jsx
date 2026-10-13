import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);
const TOAST_DURATION = 3200;

/** Provides `showToast(message, { type })` to the whole app. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    clearTimeout(timersRef.current.get(id));
    timersRef.current.delete(id);
  }, []);

  const showToast = useCallback(
    (message, { type = 'success' } = {}) => {
      const id = nextIdRef.current++;
      // Keep at most three toasts on screen.
      setToasts((list) => [...list.slice(-2), { id, message, type }]);
      timersRef.current.set(id, setTimeout(() => dismissToast(id), TOAST_DURATION));
    },
    [dismissToast],
  );

  // Clear pending timers if the provider ever unmounts.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
