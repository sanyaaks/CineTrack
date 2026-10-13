import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Favourites from './pages/Favourites';
import MovieDetails from './pages/MovieDetails';
import NotFound from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';
import { MovieProvider } from './context/MovieContext';

// Every page renders inside <Layout> (navigation + <Outlet />).
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'discover', element: <Discover /> },
      { path: 'search', element: <Search /> },
      { path: 'watchlist', element: <Watchlist /> },
      { path: 'favourites', element: <Favourites /> },
      { path: 'movie/:id', element: <MovieDetails /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <MovieProvider>
        <RouterProvider router={router} />
      </MovieProvider>
    </ToastProvider>
  );
}
