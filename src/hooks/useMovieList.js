import { useCallback, useEffect, useRef, useState } from 'react';

// Loaded pages are remembered per list, so "Back" restores exactly what you saw.
const listCache = new Map();
const EMPTY = { movies: [], page: 0, totalPages: 0, totalResults: 0 };

function initialState(key) {
  const cached = key ? listCache.get(key) : null;
  if (cached) return { ...cached, key, status: 'success', error: null };
  return { ...EMPTY, key, status: key ? 'loading' : 'idle', error: null };
}

/**
 * Paginated movie list with "Load more" support.
 * @param {string|null} key   identifies the list (e.g. "search:batman"); null = idle
 * @param {(page: number, signal: AbortSignal) => Promise<TmdbPage>} fetchPage
 */
export function useMovieList(key, fetchPage) {
  const [state, setState] = useState(() => initialState(key));
  const controllerRef = useRef(null);

  const fetchRef = useRef(fetchPage);
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  const load = useCallback(
    (page) => {
      controllerRef.current?.abort(); // cancel any request still in flight
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) =>
        page === 1
          ? { ...EMPTY, key, status: 'loading', error: null }
          : { ...prev, status: 'loadingMore', error: null },
      );

      fetchRef
        .current(page, controller.signal)
        .then((response) => {
          if (controller.signal.aborted) return;
          setState((prev) => {
            const previous = page === 1 ? [] : prev.movies;
            // TMDB lists can shift between pages, so skip duplicates.
            const seen = new Set(previous.map((movie) => movie.id));
            const fresh = (response.results ?? []).filter((movie) => !seen.has(movie.id));
            return {
              key,
              movies: [...previous, ...fresh],
              page: response.page,
              totalPages: Math.min(response.total_pages ?? 0, 500), // TMDB caps at page 500
              totalResults: response.total_results ?? 0,
              status: 'success',
              error: null,
            };
          });
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setState((prev) => ({ ...prev, status: 'error', error }));
          }
        });
    },
    [key],
  );

  // (Re)load whenever the list key changes – unless we already have it cached.
  useEffect(() => {
    if (!key) {
      setState(initialState(null));
      return undefined;
    }
    if (listCache.has(key)) setState(initialState(key));
    else load(1);
    return () => controllerRef.current?.abort();
  }, [key, load]);

  // Keep the cache up to date after each successful load.
  useEffect(() => {
    if (state.key && state.status === 'success') listCache.set(state.key, state);
  }, [state]);

  // During the render right after a key change, `state` still belongs to the old key.
  const current = state.key === key ? state : initialState(key);

  return {
    movies: current.movies,
    status: current.status,
    error: current.error,
    totalResults: current.totalResults,
    isLoading: current.status === 'loading',
    isLoadingMore: current.status === 'loadingMore',
    hasMore: current.page < current.totalPages,
    loadMore: () => load(current.page + 1),
    retry: () => load(current.movies.length ? current.page + 1 : 1),
  };
}
