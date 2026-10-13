# CineTrack 🎬

A movie discovery and watchlist web app built with **React, React Hooks, React Router, plain CSS and the TMDB API**.
Browse trending, popular, top-rated and upcoming movies, search the entire TMDB catalogue, open rich movie pages
with cast and trailers, and keep a **watchlist** and **favourites** that survive browser refreshes (`localStorage`).

> This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## Features

| Area | What it does |
| --- | --- |
| **Home** | Cinematic hero (top 5 trending, switchable), *Trending This Week*, *Top Rated* and *Upcoming* carousels, *Popular Movies* grid with **Load more** |
| **Discover** | Category tabs (Trending / Popular / Top Rated / Upcoming) + genre chips, paginated. Selection is kept in the URL (`/discover?category=top_rated&genre=28`) |
| **Search** | Debounced title search (450 ms), clear button + `Esc`, result count, empty state, trending suggestions, query kept in the URL (`/search?q=batman`) |
| **Movie details** | Backdrop, poster, rating & vote count, runtime, release date, genres, overview, director/writers, budget/revenue, production companies, top cast, YouTube trailer modal, "More like this" |
| **Watchlist** | Add/remove anywhere, persisted in `localStorage`, total count, sort (recent / title / rating / release date), genre filter, *Clear all* with confirmation |
| **Favourites** | Independent list with the same features, synced across every card and page |
| **UX** | Skeleton loaders, error states with *Try again*, toasts, poster fallbacks, lazy images, keyboard-friendly dialogs, scroll restoration on *Back*, responsive sidebar → icon rail → bottom tab bar |

---

## Tech stack

- **React 18** (functional components + Hooks) bundled with **Vite 5**
- **React Router** for pages and URL state
- **Plain CSS** with design tokens (CSS custom properties)
- **lucide-react** for icons
- **TMDB API v3** for all movie data — no mock data
- **localStorage** for the watchlist and favourites

---

## Quick start

Requirements: **Node.js 18+** (20 or newer recommended) and npm.

```bash
cd cinetrack
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
# open .env and paste your TMDB token (see next section)
npm run dev
```

Vite prints a local URL (default **http://localhost:5173**) and opens it in your browser.

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Getting TMDB API credentials

1. Create a free account at <https://www.themoviedb.org/signup> and verify your email.
2. Go to **Settings → API** (<https://www.themoviedb.org/settings/api>) and request an API key
   (choose *Developer*; for usage type you can describe it as a college project).
3. On the same page copy the **API Read Access Token** (a long string starting with `eyJ…`).
4. Put it in `.env`:

```env
VITE_TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.your-real-token...
```

You may instead use the shorter **API Key** via `VITE_TMDB_API_KEY=...` — it is only used when the token is empty.

5. **Restart `npm run dev`** — Vite only reads `.env` when it starts.

### ⚠️ About API security

Every `VITE_*` variable is **embedded into the JavaScript bundle that is sent to the browser**. Anyone can open the
browser dev tools and read it. That's acceptable for a college demo using a free, read-only TMDB token, but it is
**not** a way to hide secrets. In a real production app you would call TMDB from a small backend (or a serverless
function) that keeps the token on the server and forwards requests — a "backend proxy".

`.env` is listed in `.gitignore` so your token is never committed. Only `.env.example` (with a placeholder) is.

---

## Project structure

```
cinetrack/
├── index.html                 # HTML shell, fonts, favicon
├── vite.config.js
├── package.json
├── .env.example               # placeholder credentials (copy to .env)
├── vercel.json                # SPA rewrite for Vercel
├── public/
│   ├── favicon.svg
│   └── _redirects             # SPA rewrite for Netlify
└── src/
    ├── main.jsx               # entry point – mounts <App/>, imports CSS
    ├── App.jsx                # router + context providers
    ├── services/
    │   └── tmdb.js            # ALL TMDB calls, error handling, image URLs
    ├── hooks/
    │   ├── useFetch.js        # load data once per key (cache + AbortController)
    │   ├── useMovieList.js    # paginated lists with "Load more"
    │   ├── useDebounce.js     # delay a value until typing stops
    │   ├── useLocalStorage.js # useState that persists to localStorage
    │   └── useDocumentTitle.js
    ├── context/
    │   ├── MovieContext.jsx   # watchlist, favourites, genres (global state)
    │   └── ToastContext.jsx   # showToast() for notifications
    ├── components/
    │   ├── Layout.jsx         # shell: sidebar + page + bottom nav
    │   ├── Sidebar.jsx        # desktop/tablet navigation + genre links
    │   ├── Navbar.jsx         # mobile top bar + bottom tab bar
    │   ├── HeroSection.jsx    # featured movie banner
    │   ├── MovieCard.jsx      # poster card with quick actions
    │   ├── MovieActions.jsx   # watchlist / favourite toggle buttons
    │   ├── MovieGrid.jsx      # responsive grid (+ skeletons)
    │   ├── MovieRow.jsx       # horizontal carousel
    │   ├── Poster.jsx         # lazy image with fallback
    │   ├── SearchBar.jsx
    │   ├── GenreFilter.jsx
    │   ├── SavedMoviesView.jsx# shared Watchlist/Favourites page body
    │   ├── LoadingSkeleton.jsx
    │   ├── EmptyState.jsx
    │   ├── ErrorMessage.jsx
    │   ├── LoadMoreButton.jsx
    │   ├── Modal.jsx          # native <dialog> wrapper
    │   ├── ConfirmDialog.jsx
    │   ├── TrailerModal.jsx
    │   ├── Toast.jsx
    │   ├── Logo.jsx
    │   └── navItems.js
    ├── pages/
    │   ├── Home.jsx
    │   ├── Discover.jsx
    │   ├── Search.jsx
    │   ├── MovieDetails.jsx
    │   ├── Watchlist.jsx
    │   ├── Favourites.jsx
    │   └── NotFound.jsx
    ├── utils/
    │   └── movie.js           # formatting helpers
    └── styles/
        ├── global.css         # tokens, reset, layout, buttons
        ├── components.css     # cards, hero, chips, modal, toasts…
        └── pages.css          # page layouts + responsive breakpoints
```

---

## How it works

### TMDB integration (`src/services/tmdb.js`)

One `request()` helper builds the URL, adds the `Authorization: Bearer <token>` header (or `api_key`), and turns
failures into a `TmdbError` with a `code` the UI understands:

| Code | When | What the user sees |
| --- | --- | --- |
| `MISSING_CREDENTIALS` | no token in `.env` | setup instructions |
| `UNAUTHORIZED` | HTTP 401 | "TMDB rejected the credentials" |
| `RATE_LIMITED` | HTTP 429 (after 2 automatic retries) | "Too many requests" + Try again |
| `NOT_FOUND` | HTTP 404 | "Movie not found" page |
| `NETWORK` | offline / DNS / CORS | "Can't reach TMDB" + Try again |

Endpoints used:

| Feature | Endpoint |
| --- | --- |
| Trending | `GET /trending/movie/week` |
| Popular / Top rated / Upcoming | `GET /movie/popular`, `/movie/top_rated`, `/movie/upcoming` |
| Search | `GET /search/movie?query=` |
| Genre browsing | `GET /discover/movie?with_genres=` |
| Genres list | `GET /genre/movie/list` |
| Details | `GET /movie/{id}` |
| Cast & crew | `GET /movie/{id}/credits` |
| Trailers | `GET /movie/{id}/videos` |
| More like this | `GET /movie/{id}/recommendations` |
| Images | `https://image.tmdb.org/t/p/{w342 | w500 | w1280 | w185}/{path}` |

### Hooks

- **`useState`** – local UI state (search input, dialog open, active hero movie).
- **`useEffect`** – starts API requests, syncs `localStorage`, adds/removes event listeners. Every effect cleans up
  (aborting requests, clearing timers, removing listeners).
- **`useContext`** – `MovieContext` shares the watchlist/favourites with every card, so the heart and bookmark icons
  stay in sync everywhere. `ToastContext` shares `showToast()`.
- **`useMemo` / `useCallback`** – avoid recomputing sorted lists and keep the context value stable.
- **`useRef`** – keeps the current `AbortController`, timers and DOM nodes (carousel, dialog).
- **Custom hooks** – `useFetch`, `useMovieList`, `useDebounce`, `useLocalStorage` hide the plumbing so pages read
  almost like plain descriptions of the UI.

### Stale requests & AbortController

When you type quickly or leave a page before data arrives, the previous request is **aborted**. That prevents an old
slow response from overwriting newer results and avoids "state update on unmounted component" problems.

### localStorage

`useLocalStorage('cinetrack:watchlist', [])` works like `useState`, but writes every change to
`localStorage` and reads it back on load. Only a small summary of each movie is stored (id, title, poster, date,
rating, genre ids, and when it was added). Changes made in another tab are picked up through the `storage` event.

### Preserving browsing context

- Search query, Discover filters and Watchlist sorting live in the **URL**, so *Back* returns you to the same view.
- Loaded pages are kept in a **session cache**, so going back shows the list instantly and React Router's
  `<ScrollRestoration/>` puts you at the same scroll position.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "TMDB API key needed" | `.env` is missing or still has the placeholder. Create it from `.env.example`, paste your token, **restart** `npm run dev`. |
| "TMDB rejected the credentials" (401) | You pasted the wrong value. `VITE_TMDB_ACCESS_TOKEN` needs the long *Read Access Token* (`eyJ…`); the short 32-char key goes in `VITE_TMDB_API_KEY`. No quotes or spaces. |
| Changes to `.env` do nothing | Vite reads env files only at startup — stop the server (`Ctrl + C`) and run `npm run dev` again. The file must be named exactly `.env` and sit next to `package.json`. |
| "Can't reach TMDB" | Check your connection. Some college/office networks or ISPs block `api.themoviedb.org` — try a mobile hotspot, a different DNS (e.g. 1.1.1.1), or a VPN. |
| "Too many requests" | TMDB rate-limits bursts. Wait a few seconds and press *Try again*. |
| Posters don't load but data does | `image.tmdb.org` is blocked on your network (same fixes as above). Broken images fall back to a placeholder. |
| `npm install` fails | Update Node.js to v18+ (`node -v`). Delete `node_modules` and `package-lock.json`, then reinstall. |
| Port 5173 already in use | Vite automatically picks the next free port; use the URL it prints. |
| 404 when refreshing `/watchlist` after deploying | The host needs an SPA rewrite — see Deployment (already configured for Netlify and Vercel). |
| Watchlist disappeared | `localStorage` is per browser and per site address. A different browser, private window, cleared site data, or a different port/URL starts empty. |

---

## Deployment

The app is a static site: `npm run build` produces a `dist/` folder.

**Important:** set the environment variable on the hosting platform — your local `.env` is not uploaded.
Because the token ends up in the public bundle, use a free read-only TMDB token you are comfortable exposing.

### Vercel
1. Push the project to GitHub (`.env` is ignored automatically).
2. On <https://vercel.com> → *Add New Project* → import the repo. Framework preset: **Vite**.
3. *Environment Variables*: add `VITE_TMDB_ACCESS_TOKEN` = your token.
4. Deploy. `vercel.json` already rewrites all routes to `index.html`.

### Netlify
1. *Add new site → Import from Git*, pick the repo.
2. Build command `npm run build`, publish directory `dist`.
3. *Site configuration → Environment variables*: add `VITE_TMDB_ACCESS_TOKEN`.
4. Deploy. `public/_redirects` already handles client-side routes.

If you change the variable later, **trigger a new deploy** — Vite bakes it in at build time.

---

## Known limitations

- The TMDB token is visible in the browser bundle (see *About API security*). Use a backend proxy for production.
- Watchlist and favourites are stored per browser — there are no user accounts or cloud sync.
- TMDB only serves the first 500 pages of any list.
- Genre filtering on the Discover page uses `/discover/movie`, so "Trending + genre" is approximated by popularity.
- Data and trailers are in English (`language=en-US`).
