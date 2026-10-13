import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Play, Sparkles, Star, Users } from 'lucide-react';
import Poster from '../components/Poster';
import MovieActions from '../components/MovieActions';
import MovieRow from '../components/MovieRow';
import TrailerModal from '../components/TrailerModal';
import ErrorMessage from '../components/ErrorMessage';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import NotFound from './NotFound';
import { useFetch } from '../hooks/useFetch';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  getImageUrl,
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getRecommendations,
  IMAGE_SIZES,
  pickTrailer,
} from '../services/tmdb';
import { formatCount, formatDate, formatMoney, formatRating, formatRuntime, getYear } from '../utils/movie';

/** Details, credits and videos are three TMDB endpoints – fetched in parallel. */
async function loadMovie(id, signal) {
  const [details, credits, videos] = await Promise.all([
    getMovieDetails(id, signal),
    getMovieCredits(id, signal),
    getMovieVideos(id, signal),
  ]);
  return { details, credits, trailer: pickTrailer(videos) };
}

const LANGUAGES = new Intl.DisplayNames(['en'], { type: 'language' });

export default function MovieDetails() {
  const { id } = useParams();
  const movieId = Number(id);
  const isValidId = Number.isInteger(movieId) && movieId > 0;
  const navigate = useNavigate();
  const location = useLocation();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { data, loading, error, retry } = useFetch(isValidId ? `movie:${movieId}` : null, (signal) =>
    loadMovie(movieId, signal),
  );
  const recommendations = useFetch(isValidId ? `recommendations:${movieId}` : null, (signal) =>
    getRecommendations(movieId, signal),
  );

  useDocumentTitle(data?.details.title ?? 'Movie');

  // Go back to wherever the user came from (keeps their search, filters and scroll).
  // If they opened this page directly, there is no history entry, so go Home.
  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  }

  const backButton = (
    <button type="button" className="btn btn--ghost back-btn" onClick={goBack}>
      <ArrowLeft size={18} aria-hidden="true" /> Back
    </button>
  );

  if (!isValidId || error?.code === 'NOT_FOUND') {
    return <NotFound title="Movie not found" message="TMDB has no movie with this ID." />;
  }
  if (loading) return <DetailsSkeleton />;
  if (error) {
    return (
      <div className="page-pad">
        {backButton}
        <ErrorMessage error={error} onRetry={retry} />
      </div>
    );
  }

  const { details: movie, credits, trailer } = data;
  const backdrop = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop);
  const cast = credits.cast?.slice(0, 15) ?? [];
  const directors = credits.crew?.filter((person) => person.job === 'Director').map((p) => p.name) ?? [];
  const writers = [
    ...new Set(credits.crew?.filter((p) => p.department === 'Writing').map((p) => p.name) ?? []),
  ].slice(0, 3);

  // Only show facts TMDB actually provides.
  const facts = [
    { label: 'Director', value: directors.join(', ') },
    { label: 'Writers', value: writers.join(', ') },
    { label: 'Status', value: movie.status },
    { label: 'Original language', value: movie.original_language && LANGUAGES.of(movie.original_language) },
    { label: 'Budget', value: formatMoney(movie.budget) },
    { label: 'Revenue', value: formatMoney(movie.revenue) },
    { label: 'Production', value: movie.production_companies?.slice(0, 3).map((c) => c.name).join(', ') },
    { label: 'Countries', value: movie.production_countries?.map((c) => c.name).join(', ') },
  ].filter((fact) => fact.value);

  return (
    <article className="details">
      <div className="details__backdrop">
        {backdrop && <img src={backdrop} alt="" />}
        <div className="details__shade" />
      </div>

      <div className="details__top">{backButton}</div>

      <div className="details__layout">
        <div className="details__poster">
          <Poster path={movie.poster_path} title={movie.title} size={IMAGE_SIZES.posterLarge} eager />
        </div>

        <div className="details__info">
          <h1 className="details__title">
            {movie.title} <span className="details__year">({getYear(movie.release_date)})</span>
          </h1>
          {movie.tagline && <p className="details__tagline">{movie.tagline}</p>}

          <ul className="details__meta">
            <li className="rating rating--large">
              <Star size={18} fill="currentColor" aria-hidden="true" />
              <strong>{formatRating(movie.vote_average)}</strong>
              <span className="muted">/ 10 · {formatCount(movie.vote_count)} votes</span>
            </li>
            {movie.runtime > 0 && (
              <li>
                <Clock size={16} aria-hidden="true" /> {formatRuntime(movie.runtime)}
              </li>
            )}
            {movie.release_date && (
              <li>
                <CalendarDays size={16} aria-hidden="true" /> {formatDate(movie.release_date)}
              </li>
            )}
          </ul>

          {movie.genres?.length > 0 && (
            <ul className="chip-row chip-row--wrap" aria-label="Genres">
              {movie.genres.map((genre) => (
                <li key={genre.id} className="chip chip--static">
                  {genre.name}
                </li>
              ))}
            </ul>
          )}

          <div className="details__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setTrailerOpen(true)}
              disabled={!trailer}
              title={trailer ? undefined : 'No trailer available on YouTube'}
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              {trailer ? 'Watch Trailer' : 'No Trailer'}
            </button>
            <MovieActions movie={movie} variant="full" />
          </div>

          <section className="details__section" aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="details__heading">
              Overview
            </h2>
            <p className="details__overview">{movie.overview || 'No overview available for this movie yet.'}</p>
          </section>

          {facts.length > 0 && (
            <dl className="facts">
              {facts.map((fact) => (
                <div key={fact.label} className="facts__item">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {cast.length > 0 && (
        <section className="section details__cast" aria-labelledby="cast-heading">
          <div className="section__header">
            <h2 id="cast-heading" className="section__title">
              <Users size={20} aria-hidden="true" className="section__icon" />
              Top Cast
            </h2>
          </div>
          <ul className="cast-track">
            {cast.map((person) => (
              <li key={person.credit_id} className="cast-card">
                <div className="cast-card__photo">
                  {person.profile_path ? (
                    <img
                      src={getImageUrl(person.profile_path, IMAGE_SIZES.profile)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {person.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <p className="cast-card__name">{person.name}</p>
                {person.character && <p className="cast-card__role">{person.character}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommendations.data?.results?.length > 0 && (
        <div className="details__more">
          <MovieRow title="More Like This" icon={Sparkles} movies={recommendations.data.results} />
        </div>
      )}

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} video={trailer} movieTitle={movie.title} />
    </article>
  );
}
