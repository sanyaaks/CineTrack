import { useEffect, useState } from 'react';

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Used by the search page so we don't call the API on every keystroke.
 */
export function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // a new keystroke cancels the previous timer
  }, [value, delay]);

  return debounced;
}
