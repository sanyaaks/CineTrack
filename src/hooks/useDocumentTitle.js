import { useEffect } from 'react';

/** Sets the browser tab title, e.g. "Search · CineTrack". */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CineTrack` : 'CineTrack – Discover movies';
  }, [title]);
}
