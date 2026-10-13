/**
 * TMDB API service
 * ----------------
 * Every request to The Movie Database goes through this module, so components
 * never deal with URLs, headers or HTTP status codes directly.
 *
 * Docs: https://developer.themoviedb.org/docs
 */

const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Vite exposes variables prefixed with VITE_ to the browser bundle.
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();
const API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim();

const isPlaceholder = (value) => !value || value.startsWith('your_');
export const hasCredentials = !isPlaceholder(ACCESS_TOKEN) || !isPlaceholder(API_KEY);

/** Error type with a machine-readable `code` so the UI can show helpful messages. */
export class TmdbError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN' } = {}) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
    this.code = code;
  }
}

/** setTimeout as a promise that can be cancelled with an AbortSignal. */
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

/**
 * Core request helper.
 * @param {string} path      e.g. "/movie/popular"
 * @param {object} params    query-string parameters
 * @param {object} options   { signal } from an AbortController, retries for HTTP 429
 */
async function request(path, params = {}, { signal, retries = 2 } = {}) {
  if (!hasCredentials) {
    throw new TmdbError('TMDB credentials are missing.', { code: 'MISSING_CREDENTIALS' });
  }

  const url = new URL(API_BASE + path);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  // Prefer the Bearer token; fall back to the api_key query parameter.
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
  };

  if (isPlaceholder(ACCESS_TOKEN) && !isPlaceholder(API_KEY)) {
    delete headers.Authorization;
    url.searchParams.set('api_key', API_KEY);
  }

  let response;
  try {
    response = await fetch(url, { headers, signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new TmdbError('Could not reach TMDB. Check your internet connection.', { code: 'NETWORK' });
  }

  // Rate limited: wait briefly and try again a couple of times.
  if (response.status === 429 && retries > 0) {
    const retryAfter = Number(response.headers.get('Retry-After')) || 1;
    await wait(Math.min(retryAfter, 5) * 1000, signal);
    return request(path, params, { signal, retries: retries - 1 });
  }

  if (!response.ok) {
    let message = '';
    try {
      message = (await response.json()).status_message;
    } catch {
      // Body was not JSON – keep the generic message below.
    }
    const codeByStatus = { 401: 'UNAUTHORIZED', 404: 'NOT_FOUND', 429: 'RATE_LIMITED' };
    throw new TmdbError(message || `TMDB request failed (HTTP ${response.status}).`, {
      status: response.status,
      code: codeByStatus[response.status] ?? (response.status >= 500 ? 'SERVER' : 'HTTP'),
    });
  }

  return response.json();
}

/* ---------------------------- Movie lists ---------------------------- */

export const getTrending = (page = 1, signal) =>
  request('/trending/movie/week', { page }, { signal });

export const getPopular = (page = 1, signal) => request('/movie/popular', { page }, { signal });

export const getTopRated = (page = 1, signal) => request('/movie/top_rated', { page }, { signal });

export const getUpcoming = (page = 1, signal) => request('/movie/upcoming', { page }, { signal });

export const searchMovies = (query, page = 1, signal) =>
  request('/search/movie', { query, page, include_adult: false }, { signal });

/** Discover endpoint – used for browsing by genre. */
export const discoverMovies = ({ genreId, sortBy = 'popularity.desc', page = 1, filters = {} }, signal) =>
  request(
    '/discover/movie',
    { with_genres: genreId, sort_by: sortBy, page, include_adult: false, ...filters },
    { signal },
  );

/* --------------------------- Single movie ---------------------------- */

export const getMovieDetails = (id, signal) => request(`/movie/${id}`, {}, { signal });

export const getMovieCredits = (id, signal) => request(`/movie/${id}/credits`, {}, { signal });

export const getMovieVideos = (id, signal) =>
  request(`/movie/${id}/videos`, {}, { signal }).then((data) => data.results ?? []);

export const getRecommendations = (id, signal) =>
  request(`/movie/${id}/recommendations`, {}, { signal });

/* ------------------------------ Genres ------------------------------- */

export const getGenres = (signal) =>
  request('/genre/movie/list', {}, { signal }).then((data) => data.genres ?? []);

/* --------------------------- Categories ------------------------------ */

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The four movie lists used on Home and Discover.
 * `fetchPage` loads the plain list; `discover` describes the same list when a
 * genre filter is applied (TMDB's list endpoints cannot filter by genre).
 */
export const CATEGORIES = {
  trending: {
    label: 'Trending',
    fetchPage: getTrending,
    discover: () => ({ sortBy: 'popularity.desc' }),
  },
  popular: {
    label: 'Popular',
    fetchPage: getPopular,
    discover: () => ({ sortBy: 'popularity.desc' }),
  },
  top_rated: {
    label: 'Top Rated',
    fetchPage: getTopRated,
    discover: () => ({ sortBy: 'vote_average.desc', filters: { 'vote_count.gte': 300 } }),
  },
  upcoming: {
    label: 'Upcoming',
    fetchPage: getUpcoming,
    discover: () => ({ sortBy: 'popularity.desc', filters: { 'primary_release_date.gte': today() } }),
  },
};

/* ------------------------------ Images ------------------------------- */

// Sizes documented by TMDB's /configuration endpoint.
export const IMAGE_SIZES = {
  poster: 'w342',
  posterLarge: 'w500',
  backdrop: 'w1280',
  backdropSmall: 'w780',
  profile: 'w185',
};

/** Returns a full image URL, or null when TMDB has no image for this item. */
export function getImageUrl(path, size = IMAGE_SIZES.poster) {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** Picks the best YouTube trailer (official trailers first, then teasers). */
export function pickTrailer(videos = []) {
  const youtube = videos.filter((video) => video.site === 'YouTube');
  return (
    youtube.find((v) => v.type === 'Trailer' && v.official) ??
    youtube.find((v) => v.type === 'Trailer') ??
    youtube.find((v) => v.type === 'Teaser') ??
    null
  );
}
