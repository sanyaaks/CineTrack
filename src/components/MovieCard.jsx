import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Poster from './Poster';
import MovieActions from './MovieActions';
import { useMovies } from '../context/MovieContext';
import { formatRating, getYear } from '../utils/movie';

/** Poster card used in every grid and carousel. */
function MovieCard({ movie }) {
  const { genreMap } = useMovies();
  const genreName = genreMap.get(movie.genre_ids?.[0]);

  return (
    <article className="movie-card">
      {/* The link and the action buttons are siblings: buttons may not live inside a link. */}
      <Link to={`/movie/${movie.id}`} className="movie-card__link">
        <div className="movie-card__poster">
          <Poster path={movie.poster_path} title={movie.title} />
          <span className="movie-card__rating" aria-label={`Rated ${formatRating(movie.vote_average)} out of 10`}>
            <Star size={12} aria-hidden="true" fill="currentColor" />
            {formatRating(movie.vote_average)}
          </span>
        </div>
        <div className="movie-card__body">
          <h3 className="movie-card__title">{movie.title}</h3>
          <p className="movie-card__meta">
            <span>{getYear(movie.release_date)}</span>
            {genreName && (
              <>
                <span className="dot" aria-hidden="true" />
                <span>{genreName}</span>
              </>
            )}
          </p>
        </div>
      </Link>
      <div className="movie-card__actions">
        <MovieActions movie={movie} />
      </div>
    </article>
  );
}

export default memo(MovieCard);
