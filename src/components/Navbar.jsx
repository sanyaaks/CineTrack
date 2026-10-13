import { Link, NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import Logo from './Logo';
import { NAV_ITEMS } from './navItems';
import { useMovies } from '../context/MovieContext';

/** Top bar shown on phones only. */
export default function Navbar() {
  return (
    <header className="topbar">
      <Link to="/" aria-label="CineTrack home">
        <Logo />
      </Link>
      <Link to="/search" className="icon-btn" aria-label="Search movies">
        <Search size={20} aria-hidden="true" />
      </Link>
    </header>
  );
}

/** Thumb-friendly bottom tab bar shown on phones only. */
export function BottomNav() {
  const { watchlist, favourites } = useMovies();
  const counts = { watchlist: watchlist.length, favourites: favourites.length };

  return (
    <nav className="bottom-nav" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, countKey }) => (
        <NavLink key={to} to={to} end={end} className="bottom-nav__link">
          <span className="bottom-nav__icon">
            <Icon size={21} aria-hidden="true" />
            {countKey && counts[countKey] > 0 && <span className="bottom-nav__dot" aria-hidden="true" />}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
