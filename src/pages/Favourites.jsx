import { Heart } from 'lucide-react';
import SavedMoviesView from '../components/SavedMoviesView';
import { useMovies } from '../context/MovieContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Favourites() {
  const { favourites, clearFavourites } = useMovies();
  useDocumentTitle('Favourites');

  return (
    <div className="page-pad">
      <SavedMoviesView
        title="Favourites"
        description="Movies you love"
        icon={Heart}
        movies={favourites}
        onClear={clearFavourites}
        emptyTitle="No favourites yet"
        emptyMessage="Tap the heart on any movie to add it to your favourites."
      />
    </div>
  );
}
