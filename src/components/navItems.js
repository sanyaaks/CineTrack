import { Bookmark, Compass, Heart, House, Search } from 'lucide-react';

/** Shared by the desktop sidebar and the mobile bottom navigation. */
export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark, countKey: 'watchlist' },
  { to: '/favourites', label: 'Favourites', icon: Heart, countKey: 'favourites' },
];
