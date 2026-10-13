import { CalendarClock, Flame, Sparkles, Trophy } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import MovieGrid from '../components/MovieGrid';
import LoadMoreButton from '../components/LoadMoreButton';
import ErrorMessage from '../components/ErrorMessage';
import { useFetch } from '../hooks/useFetch';
import { useMovieList } from '../hooks/useMovieList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPopular, getTopRated, getTrending, getUpcoming, hasCredentials, TmdbError } from '../services/tmdb';

export default function Home() {
  useDocumentTitle();

  // Each section loads independently, so one failure doesn't break the page.
  const trending = useFetch('trending:1', (signal) => getTrending(1, signal));
  const topRated = useFetch('top_rated:1', (signal) => getTopRated(1, signal));
  const upcoming = useFetch('upcoming:1', (signal) => getUpcoming(1, signal));
  const popular = useMovieList('home:popular', (page, signal) => getPopular(page, signal));

  if (!hasCredentials) {
    return (
      <div className="page-pad">
        <ErrorMessage error={new TmdbError('Missing credentials', { code: 'MISSING_CREDENTIALS' })} />
      </div>
    );
  }

  const heroMovies = (trending.data?.results ?? []).filter((movie) => movie.backdrop_path).slice(0, 5);

  return (
    <>
      <HeroSection movies={heroMovies} loading={trending.loading} />

      <MovieRow
        title="Trending This Week"
        icon={Flame}
        movies={trending.data?.results}
        loading={trending.loading}
        error={trending.error}
        onRetry={trending.retry}
        seeAllTo="/discover?category=trending"
      />
      <MovieRow
        title="Top Rated"
        icon={Trophy}
        movies={topRated.data?.results}
        loading={topRated.loading}
        error={topRated.error}
        onRetry={topRated.retry}
        seeAllTo="/discover?category=top_rated"
      />
      <MovieRow
        title="Upcoming Movies"
        icon={CalendarClock}
        movies={upcoming.data?.results}
        loading={upcoming.loading}
        error={upcoming.error}
        onRetry={upcoming.retry}
        seeAllTo="/discover?category=upcoming"
      />

      <section className="section" aria-labelledby="popular-heading">
        <div className="section__header">
          <h2 id="popular-heading" className="section__title">
            <Sparkles size={20} aria-hidden="true" className="section__icon" />
            Popular Movies
          </h2>
        </div>
        <MovieGrid movies={popular.movies} loading={popular.isLoading || popular.isLoadingMore} />
        {popular.status === 'error' ? (
          <ErrorMessage error={popular.error} onRetry={popular.retry} compact />
        ) : (
          !popular.isLoading && (
            <LoadMoreButton onClick={popular.loadMore} loading={popular.isLoadingMore} hasMore={popular.hasMore} />
          )
        )}
      </section>
    </>
  );
}
