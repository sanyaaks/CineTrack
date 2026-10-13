import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, TextSearch, TrendingUp } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import LoadMoreButton from '../components/LoadMoreButton';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import { useMovieList } from '../hooks/useMovieList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getTrending, hasCredentials, searchMovies } from '../services/tmdb';
import { pluralize } from '../utils/movie';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? ''; // the URL is the source of truth for the active search
  const [input, setInput] = useState(query);
  const debouncedInput = useDebounce(input.trim(), 450);
  const inputRef = useRef(null);

  useDocumentTitle(query ? `“${query}”` : 'Search');

  // Focus the search box when the page opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // The last query we wrote to the URL. Lets us tell our own URL updates apart
  // from outside ones (Back/Forward buttons, clicking "Search" in the nav).
  const syncedRef = useRef(query);

  function applyQuery(value) {
    syncedRef.current = value;
    setParams(value ? { q: value } : {}, { replace: true });
  }

  // When the user pauses typing, write the query into the URL (?q=...).
  useEffect(() => {
    if (debouncedInput !== syncedRef.current) applyQuery(debouncedInput);
  }, [debouncedInput]);

  // The URL changed from outside – show that query in the box.
  useEffect(() => {
    if (query !== syncedRef.current) {
      syncedRef.current = query;
      setInput(query);
    }
  }, [query]);

  function handleChange(value) {
    setInput(value);
    if (!value.trim()) applyQuery(''); // clearing is instant, no debounce needed
  }

  function handleSuggestion(title) {
    setInput(title);
    applyQuery(title);
  }

  const results = useMovieList(query ? `search:${query.toLowerCase()}` : null, (page, signal) =>
    searchMovies(query, page, signal),
  );

  // Trending titles are offered as suggestions while the box is empty (cached from Home).
  const trending = useFetch(!query && hasCredentials ? 'trending:1' : null, (signal) => getTrending(1, signal));
  const suggestions = (trending.data?.results ?? []).slice(0, 8);

  const isTyping = input.trim() !== query;

  return (
    <div className="page-pad">
      <header className="page-header page-header--stack">
        <h1 className="page-title">Search</h1>
        <SearchBar ref={inputRef} value={input} onChange={handleChange} busy={isTyping || results.isLoading} />
      </header>

      {!query ? (
        <>
          <EmptyState
            icon={TextSearch}
            title="Search the whole TMDB catalogue"
            message={<p>Type a movie title — results appear as you type.</p>}
            compact
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              <p className="suggestions__label">
                <TrendingUp size={16} aria-hidden="true" /> Trending searches
              </p>
              <div className="chip-row chip-row--wrap">
                {suggestions.map((movie) => (
                  <button key={movie.id} type="button" className="chip" onClick={() => handleSuggestion(movie.title)}>
                    {movie.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : results.status === 'error' && results.movies.length === 0 ? (
        <ErrorMessage error={results.error} onRetry={results.retry} />
      ) : results.status === 'success' && results.movies.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No movies found for “${query}”`}
          message={<p>Check the spelling, or try a shorter or different title.</p>}
          action={
            <button type="button" className="btn btn--secondary" onClick={() => handleChange('')}>
              Clear search
            </button>
          }
        />
      ) : (
        <section aria-live="polite" aria-busy={results.isLoading}>
          <p className="results-count">
            {results.isLoading ? 'Searching…' : `${pluralize(results.totalResults, 'result')} for “${query}”`}
          </p>
          <MovieGrid movies={results.movies} loading={results.isLoading || results.isLoadingMore} />
          {results.status === 'error' ? (
            <ErrorMessage error={results.error} onRetry={results.retry} compact />
          ) : (
            !results.isLoading && (
              <LoadMoreButton onClick={results.loadMore} loading={results.isLoadingMore} hasMore={results.hasMore} />
            )
          )}
        </section>
      )}
    </div>
  );
}
