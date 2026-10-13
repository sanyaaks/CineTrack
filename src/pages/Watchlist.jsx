import { Bookmark } from 'lucide-react';
import SavedMoviesView from '../components/SavedMoviesView';
import { useMovies } from '../context/MovieContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Watchlist() {
  const { watchlist, clearWatchlist } = useMovies();
  useDocumentTitle('My Watchlist');

  return (
    <div className="page-pad">
      <SavedMoviesView
        title="My Watchlist"
        description="Movies you plan to watch"
        icon={Bookmark}
        movies={watchlist}
        onClear={clearWatchlist}
        emptyTitle="Your watchlist is empty"
        emptyMessage="Tap the bookmark on any movie to save it here for later. It stays saved even after you close the browser."
      />
    </div>
  );
}
