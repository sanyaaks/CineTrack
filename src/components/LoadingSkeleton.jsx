/** Grey placeholder shapes shown while data loads. */

export function CardSkeleton() {
  return (
    <div className="movie-card skeleton-card" aria-hidden="true">
      <div className="skeleton movie-card__poster" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--short" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="hero hero--skeleton" aria-busy="true" aria-label="Loading featured movie">
      <div className="hero__content">
        <div className="skeleton skeleton--pill" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
      </div>
    </section>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="details" aria-busy="true" aria-label="Loading movie details">
      <div className="details__backdrop skeleton" />
      <div className="details__layout">
        <div className="details__poster skeleton" />
        <div className="details__info">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--line skeleton--short" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
