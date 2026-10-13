import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import Logo from './Logo';
import { NAV_ITEMS } from './navItems';
import { useMovies } from '../context/MovieContext';

/** Desktop navigation (collapses to an icon rail on tablets, hidden on phones). */
export default function Sidebar() {
  const { watchlist, favourites, genres } = useMovies();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const counts = { watchlist: watchlist.length, favourites: favourites.length };
  const activeGenre = pathname === '/discover' ? params.get('genre') : null;

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__brand" aria-label="CineTrack home">
        <Logo />
      </Link>

      <nav className="sidebar__section" aria-label="Main">
        <p className="sidebar__heading">Menu</p>
        <ul className="sidebar__list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, countKey }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="sidebar__link" title={label}>
                <Icon size={20} aria-hidden="true" />
                <span className="sidebar__label">{label}</span>
                {countKey && counts[countKey] > 0 && (
                  <span className="sidebar__count" aria-label={`${counts[countKey]} saved`}>
                    {counts[countKey]}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {genres.length > 0 && (
        <nav className="sidebar__section sidebar__genres" aria-label="Browse by genre">
          <p className="sidebar__heading">Genres</p>
          <ul className="sidebar__genre-list">
            {genres.map((genre) => {
              const isActive = activeGenre === String(genre.id);
              return (
                <li key={genre.id}>
                  <Link
                    to={`/discover?genre=${genre.id}`}
                    className={`sidebar__genre ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {genre.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <p className="sidebar__credit">
        Movie data &amp; images from{' '}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </aside>
  );
}
