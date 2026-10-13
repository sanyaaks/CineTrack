import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { CardSkeleton } from './LoadingSkeleton';
import ErrorMessage from './ErrorMessage';

/** Horizontal, scrollable carousel of movie cards with arrow controls. */
export default function MovieRow({ title, icon: Icon, movies, loading, error, onRetry, seeAllTo }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Work out whether the arrows should be enabled.
  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges, movies]);

  function scroll(direction) {
    const track = trackRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const headingId = `row-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <section className="section" aria-labelledby={headingId}>
      <div className="section__header">
        <h2 id={headingId} className="section__title">
          {Icon && <Icon size={20} aria-hidden="true" className="section__icon" />}
          {title}
        </h2>
        <div className="section__controls">
          {seeAllTo && (
            <Link to={seeAllTo} className="link-more">
              See all <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          {!error && (
            <div className="row-arrows">
              <button
                type="button"
                className="icon-btn"
                onClick={() => scroll(-1)}
                disabled={edges.start}
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => scroll(1)}
                disabled={edges.end}
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={onRetry} compact />
      ) : (
        <div className="row-track" ref={trackRef} onScroll={updateEdges}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)
            : movies?.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </section>
  );
}
