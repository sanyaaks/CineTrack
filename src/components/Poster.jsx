import { useState } from 'react';
import { Film } from 'lucide-react';
import { getImageUrl, IMAGE_SIZES } from '../services/tmdb';

/**
 * Lazy-loaded TMDB image with a fade-in and a placeholder for
 * missing or broken images.
 */
export default function Poster({ path, title, size = IMAGE_SIZES.poster, className = '', eager = false }) {
  const src = getImageUrl(path, size);
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`poster poster--fallback ${className}`} role="img" aria-label={`No poster for ${title}`}>
        <Film size={28} aria-hidden="true" />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <img
      className={`poster ${loadedSrc === src ? 'is-loaded' : ''} ${className}`}
      src={src}
      alt={`${title} poster`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
