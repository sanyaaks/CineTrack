import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * A tiny in-memory cache shared by every component during this browser session.
 * Coming back to a page shows the cached data instantly (no skeleton flash),
 * which also lets the router restore the previous scroll position.
 */
const cache = new Map();
const MAX_ENTRIES = 150;

function remember(key, data) {
  cache.delete(key);
  cache.set(key, data);
  if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value); // drop the oldest
}

/**
 * Loads data once per `key`.
 * @param {string|null} key   unique cache key; pass null to skip fetching
 * @param {(signal: AbortSignal) => Promise<any>} fetcher
 * @returns {{ data, error, loading, retry }}
 */
export function useFetch(key, fetcher) {
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  // Always call the latest fetcher without re-running the effect on every render.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!key || cache.has(key)) return undefined;

    // AbortController cancels the request if the component unmounts or the key
    // changes, so a slow, stale response can never overwrite newer data.
    const controller = new AbortController();
    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        remember(key, data);
        setResult({ key, data, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setResult({ key, data: null, error });
      });

    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => {
    setResult((prev) => ({ ...prev, error: null }));
    setAttempt((n) => n + 1);
  }, []);

  const cached = key ? cache.get(key) : undefined;
  const isCurrent = result.key === key;
  const data = cached ?? (isCurrent ? result.data : null);
  const error = !cached && isCurrent ? result.error : null;

  return { data, error, loading: Boolean(key) && !data && !error, retry };
}
