import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Info, Star } from 'lucide-react';
import { HeroSkeleton } from './LoadingSkeleton';
import MovieActions from './MovieActions';
import { useMovies } from '../context/MovieContext';
import { getImageUrl, IMAGE_SIZES } from '../services/tmdb';
import { formatRating, getYear } from '../utils/movie';

/** Big cinematic banner featuring one of this week's trending movies. */
export default function HeroSection({ movies = [], loading }) {
  const { genreMap } = useMovies();
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) return <HeroSkeleton />;

  const movie = movies[activeIndex] ?? movies[0];

  // No data (e.g. API error) – still show a welcoming banner.
  if (!movie) {
    return (
      <section className="hero hero--plain">
        <div className="hero__content">
          <p className="hero__eyebrow">Welcome to CineTrack</p>
          <h1 className="hero__title">Find your next favourite film.</h1>
          <p className="hero__overview">Browse what's trending, search the TMDB catalogue and keep a watchlist.</p>
          <div className="hero__actions">
            <Link to="/discover" className="btn btn--primary">
              <Compass size={18} aria-hidden="true" /> Explore Movies
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const genres = movie.genre_ids
    .map((id) => genreMap.get(id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* key forces a fresh <img> so each backdrop fades in */}
      <img
        key={movie.id}
        className="hero__backdrop"
        src={getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop)}
        alt=""
        fetchpriority="high"
      />
      <div className="hero__shade" />

      <div className="hero__content">
        <p className="hero__eyebrow">#{activeIndex + 1} Trending this week</p>
        <h1 id="hero-title" className="hero__title">
          {movie.title}
        </h1>
        <div className="hero__meta">
          <span className="rating">
            <Star size={16} fill="currentColor" aria-hidden="true" />
            {formatRating(movie.vote_average)}
          </span>
          <span>{getYear(movie.release_date)}</span>
          {genres.map((genre) => (
            <span key={genre} className="chip chip--static">
              {genre}
            </span>
          ))}
        </div>
        <p className="hero__overview">{movie.overview}</p>
        <div className="hero__actions">
          <Link to="/discover" className="btn btn--primary">
            <Compass size={18} aria-hidden="true" /> Explore Movies
          </Link>
          <Link to={`/movie/${movie.id}`} className="btn btn--ghost">
            <Info size={18} aria-hidden="true" /> Details
          </Link>
          <div className="hero__quick">
            <MovieActions movie={movie} />
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="hero__dots" role="group" aria-label="Choose featured movie">
          {movies.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`hero__dot ${index === activeIndex ? 'is-active' : ''}`}
              aria-label={`Feature ${item.title}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
