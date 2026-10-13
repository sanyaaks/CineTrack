/**
 * Small formatting helpers shared by cards, lists and the details page.
 */

/**
 * Keeps only the fields we need when saving a movie to localStorage.
 * The details endpoint returns `genres: [{id, name}]` while list endpoints
 * return `genre_ids: [..]`, so both shapes are normalised here.
 */
export function toMovieSummary(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average ?? 0,
    overview: movie.overview ?? '',
    genre_ids: movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
  };
}

export const getYear = (date) => (date ? date.slice(0, 4) : 'TBA');

export const formatRating = (rating) => (rating ? rating.toFixed(1) : 'NR');

export function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatDate(date) {
  if (!date) return null;
  // Append a time so the date is not shifted by the user's timezone.
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatMoney(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCount = (count) => new Intl.NumberFormat('en-US').format(count ?? 0);

export const pluralize = (count, word) => `${formatCount(count)} ${word}${count === 1 ? '' : 's'}`;
