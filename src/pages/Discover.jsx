import { useSearchParams } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import GenreFilter from '../components/GenreFilter';
import LoadMoreButton from '../components/LoadMoreButton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useMovies } from '../context/MovieContext';
import { useMovieList } from '../hooks/useMovieList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CATEGORIES, discoverMovies } from '../services/tmdb';
import { pluralize } from '../utils/movie';

/**
 * Browse by category (Trending / Popular / Top Rated / Upcoming) and genre.
 * The selection lives in the URL, e.g. /discover?category=top_rated&genre=28,
 * so it can be bookmarked and is restored when you come back.
 */
export default function Discover() {
  const { genres, genreMap } = useMovies();
  const [params, setParams] = useSearchParams();

  const category = CATEGORIES[params.get('category')] ? params.get('category') : 'popular';
  const genreId = Number(params.get('genre')) || null;
  const genreName = genreMap.get(genreId);
  const categoryLabel = CATEGORIES[category].label;

  useDocumentTitle(genreName ? `${genreName} movies` : `${categoryLabel} movies`);

  // TMDB's list endpoints can't filter by genre, so genre browsing uses /discover/movie.
  const list = useMovieList(`discover:${category}:${genreId ?? 'all'}`, (page, signal) =>
    genreId
      ? discoverMovies({ genreId, page, ...CATEGORIES[category].discover() }, signal)
      : CATEGORIES[category].fetchPage(page, signal),
  );

  function update(name, value) {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(name);
    else next.set(name, String(value));
    setParams(next, { replace: true });
  }

  return (
    <div className="page-pad">
      <header className="page-header">
        <div>
          <h1 className="page-title">{genreName ? `${genreName} Movies` : 'Discover'}</h1>
          <p className="page-subtitle">
            {list.totalResults > 0
              ? `${categoryLabel} · ${pluralize(list.totalResults, 'title')}`
              : 'Browse by category and genre.'}
          </p>
        </div>
      </header>

      <div className="tabs" role="group" aria-label="Category">
        {Object.entries(CATEGORIES).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            className={`tab ${key === category ? 'is-active' : ''}`}
            aria-pressed={key === category}
            onClick={() => update('category', key)}
          >
            {label}
          </button>
        ))}
      </div>

      {genres.length > 0 && (
        <div className="toolbar">
          <GenreFilter genres={genres} selected={genreId} onSelect={(id) => update('genre', id)} />
        </div>
      )}

      {list.status === 'error' && list.movies.length === 0 ? (
        <ErrorMessage error={list.error} onRetry={list.retry} />
      ) : list.status === 'success' && list.movies.length === 0 ? (
        <EmptyState icon={Clapperboard} title="Nothing here yet" message={<p>Try another genre or category.</p>} />
      ) : (
        <>
          <MovieGrid movies={list.movies} loading={list.isLoading || list.isLoadingMore} />
          {list.status === 'error' ? (
            <ErrorMessage error={list.error} onRetry={list.retry} compact />
          ) : (
            !list.isLoading && <LoadMoreButton onClick={list.loadMore} loading={list.isLoadingMore} hasMore={list.hasMore} />
          )}
        </>
      )}
    </div>
  );
}
