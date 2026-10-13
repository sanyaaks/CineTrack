import MovieCard from './MovieCard';
import { CardSkeleton } from './LoadingSkeleton';

/**
 * Responsive poster grid. While `loading`, skeleton cards are appended
 * after any movies already shown (used for both first load and "Load more").
 */
export default function MovieGrid({ movies = [], loading = false, skeletonCount = 12 }) {
  return (
    <div className="movie-grid" aria-busy={loading}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
      {loading && Array.from({ length: skeletonCount }, (_, i) => <CardSkeleton key={`skeleton-${i}`} />)}
    </div>
  );
}
