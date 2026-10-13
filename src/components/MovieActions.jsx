import { Bookmark, BookmarkCheck, Heart } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

/**
 * Watchlist + favourite toggle buttons. Reading state from context keeps
 * cards, the hero and the details page in sync automatically.
 * variant "icon" → round icon buttons (cards); "full" → labelled buttons.
 */
export default function MovieActions({ movie, variant = 'icon' }) {
  const { isInWatchlist, toggleWatchlist, isFavourite, toggleFavourite } = useMovies();
  const inWatchlist = isInWatchlist(movie.id);
  const favourite = isFavourite(movie.id);

  const watchlistLabel = inWatchlist
    ? `Remove ${movie.title} from watchlist`
    : `Add ${movie.title} to watchlist`;
  const favouriteLabel = favourite
    ? `Remove ${movie.title} from favourites`
    : `Add ${movie.title} to favourites`;
  const WatchIcon = inWatchlist ? BookmarkCheck : Bookmark;

  if (variant === 'full') {
    return (
      <>
        <button
          type="button"
          className={`btn btn--secondary ${inWatchlist ? 'is-active' : ''}`}
          aria-pressed={inWatchlist}
          aria-label={watchlistLabel}
          onClick={() => toggleWatchlist(movie)}
        >
          <WatchIcon size={18} aria-hidden="true" />
          {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
        <button
          type="button"
          className={`btn btn--secondary btn--heart ${favourite ? 'is-active' : ''}`}
          aria-pressed={favourite}
          aria-label={favouriteLabel}
          onClick={() => toggleFavourite(movie)}
        >
          <Heart size={18} aria-hidden="true" fill={favourite ? 'currentColor' : 'none'} />
          {favourite ? 'Favourited' : 'Favourite'}
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`action-btn action-btn--heart ${favourite ? 'is-active' : ''}`}
        aria-pressed={favourite}
        aria-label={favouriteLabel}
        title={favourite ? 'Remove from favourites' : 'Add to favourites'}
        onClick={() => toggleFavourite(movie)}
      >
        <Heart size={17} aria-hidden="true" fill={favourite ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        className={`action-btn ${inWatchlist ? 'is-active' : ''}`}
        aria-pressed={inWatchlist}
        aria-label={watchlistLabel}
        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        onClick={() => toggleWatchlist(movie)}
      >
        <WatchIcon size={17} aria-hidden="true" />
      </button>
    </>
  );
}
