import { Outlet, ScrollRestoration } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar, { BottomNav } from './Navbar';

/** App shell: navigation around the current page (<Outlet />). */
export default function Layout() {
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main id="main" className="page" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      {/* Restores the scroll position when using the browser's Back button. */}
      <ScrollRestoration />
    </div>
  );
}
