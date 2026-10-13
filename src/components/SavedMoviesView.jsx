import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Compass, FilterX, Trash2 } from 'lucide-react';
import MovieGrid from './MovieGrid';
import GenreFilter from './GenreFilter';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { useMovies } from '../context/MovieContext';
import { pluralize } from '../utils/movie';

const SORTERS = {
  recent: { label: 'Recently added', compare: (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0) },
  title: { label: 'Title (A–Z)', compare: (a, b) => a.title.localeCompare(b.title) },
  rating: { label: 'Highest rated', compare: (a, b) => b.vote_average - a.vote_average },
  release: { label: 'Newest release', compare: (a, b) => (b.release_date || '').localeCompare(a.release_date || '') },
};

/**
 * Shared page body for "My Watchlist" and "Favourites":
 * count, genre filter, sorting, clear-all with confirmation, empty states.
 * Sort and filter live in the URL (?sort=rating&genre=28) so they survive navigation.
 */
export default function SavedMoviesView({ title, description, icon: Icon, movies, onClear, emptyTitle, emptyMessage }) {
  const { genreMap } = useMovies();
  const [params, setParams] = useSearchParams();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sortKey = SORTERS[params.get('sort')] ? params.get('sort') : 'recent';
  const genreId = Number(params.get('genre')) || null;

  function updateParam(name, value) {
    const next = new URLSearchParams(params);
    if (value === null || value === 'recent') next.delete(name);
    else next.set(name, String(value));
    setParams(next, { replace: true });
  }

  // Only offer genres that actually appear in this list, with counts.
  const { genreOptions, genreCounts } = useMemo(() => {
    const counts = new Map();
    movies.forEach((movie) => movie.genre_ids?.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1)));
    const options = [...counts.keys()]
      .filter((id) => genreMap.has(id))
      .map((id) => ({ id, name: genreMap.get(id) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { genreOptions: options, genreCounts: counts };
  }, [movies, genreMap]);

  const visibleMovies = useMemo(() => {
    const filtered = genreId ? movies.filter((movie) => movie.genre_ids?.includes(genreId)) : movies;
    return [...filtered].sort(SORTERS[sortKey].compare);
  }, [movies, genreId, sortKey]);

  return (
    <div className="saved-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            <Icon size={26} aria-hidden="true" className="page-title__icon" />
            {title}
          </h1>
          <p className="page-subtitle">
            {movies.length > 0 ? `${pluralize(movies.length, 'movie')} saved · ${description}` : description}
          </p>
        </div>
        {movies.length > 0 && (
          <button type="button" className="btn btn--ghost btn--danger-text" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={17} aria-hidden="true" /> Clear all
          </button>
        )}
      </header>

      {movies.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={emptyTitle}
          message={<p>{emptyMessage}</p>}
          action={
            <Link to="/discover" className="btn btn--primary">
              <Compass size={18} aria-hidden="true" /> Discover movies
            </Link>
          }
        />
      ) : (
        <>
          <div className="toolbar">
            {genreOptions.length > 0 && (
              <GenreFilter
                genres={genreOptions}
                selected={genreId}
                counts={genreCounts}
                onSelect={(id) => updateParam('genre', id)}
              />
            )}
            <label className="select">
              <ArrowUpDown size={16} aria-hidden="true" />
              <span className="visually-hidden">Sort by</span>
              <select value={sortKey} onChange={(event) => updateParam('sort', event.target.value)}>
                {Object.entries(SORTERS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visibleMovies.length > 0 ? (
            <MovieGrid movies={visibleMovies} />
          ) : (
            <EmptyState
              icon={FilterX}
              title={`No ${genreMap.get(genreId) ?? ''} movies here`}
              message={<p>Try another genre or show everything.</p>}
              action={
                <button type="button" className="btn btn--secondary" onClick={() => updateParam('genre', null)}>
                  Show all
                </button>
              }
              compact
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Clear ${title.toLowerCase()}?`}
        message={`This removes all ${pluralize(movies.length, 'movie')} from ${title.toLowerCase()}. This can't be undone.`}
        confirmLabel="Clear all"
        onConfirm={onClear}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
