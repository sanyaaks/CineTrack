import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFetch } from '../hooks/useFetch';
import { getGenres, hasCredentials } from '../services/tmdb';
import { toMovieSummary } from '../utils/movie';
import { useToast } from './ToastContext';

const MovieContext = createContext(null);

/**
 * One saved list (watchlist or favourites) persisted in localStorage.
 * Both lists behave the same way, so the logic lives here once.
 */
function useSavedList(storageKey, listName, showToast) {
  const [items, setItems] = useLocalStorage(storageKey, []);

  // A Set gives fast "is this movie saved?" checks for every card on screen.
  const ids = useMemo(() => new Set(items.map((movie) => movie.id)), [items]);

  const has = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback(
    (movie) => {
      if (ids.has(movie.id)) {
        setItems((list) => list.filter((saved) => saved.id !== movie.id));
        showToast(`Removed “${movie.title}” from ${listName}`, { type: 'info' });
      } else {
        const entry = { ...toMovieSummary(movie), addedAt: Date.now() };
        setItems((list) => [entry, ...list.filter((saved) => saved.id !== movie.id)]);
        showToast(`Added “${movie.title}” to ${listName}`);
      }
    },
    [ids, setItems, showToast, listName],
  );

  const clear = useCallback(() => {
    setItems([]);
    showToast(`Cleared ${listName}`, { type: 'info' });
  }, [setItems, showToast, listName]);

  // Memoised so the context value below only changes when a list really changes.
  return useMemo(() => ({ items, has, toggle, clear }), [items, has, toggle, clear]);
}

export function MovieProvider({ children }) {
  const showToast = useToast();
  const watchlist = useSavedList('cinetrack:watchlist', 'your watchlist', showToast);
  const favourites = useSavedList('cinetrack:favourites', 'favourites', showToast);

  // Genres are fetched once and shared: cards turn genre ids into names with this map.
  const { data: genres } = useFetch(hasCredentials ? 'genres' : null, getGenres);
  const genreMap = useMemo(() => new Map((genres ?? []).map((g) => [g.id, g.name])), [genres]);

  const value = useMemo(
    () => ({
      genres: genres ?? [],
      genreMap,
      watchlist: watchlist.items,
      isInWatchlist: watchlist.has,
      toggleWatchlist: watchlist.toggle,
      clearWatchlist: watchlist.clear,
      favourites: favourites.items,
      isFavourite: favourites.has,
      toggleFavourite: favourites.toggle,
      clearFavourites: favourites.clear,
    }),
    [genres, genreMap, watchlist, favourites],
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (!context) throw new Error('useMovies must be used inside <MovieProvider>');
  return context;
}
