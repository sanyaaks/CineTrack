import { KeyRound, RefreshCw, ServerCrash, Timer, WifiOff } from 'lucide-react';
import EmptyState from './EmptyState';

/** Turns a TmdbError into a helpful, human-readable message. */
function describe(error) {
  switch (error?.code) {
    case 'MISSING_CREDENTIALS':
      return {
        icon: KeyRound,
        title: 'TMDB API key needed',
        message: (
          <>
            <p>
              Copy <code>.env.example</code> to <code>.env</code>, paste your TMDB Read Access Token into{' '}
              <code>VITE_TMDB_ACCESS_TOKEN</code>, then restart <code>npm run dev</code>.
            </p>
          </>
        ),
        canRetry: false,
      };
    case 'UNAUTHORIZED':
      return {
        icon: KeyRound,
        title: 'TMDB rejected the credentials',
        message: <p>Check the token in your <code>.env</code> file is correct and restart the dev server.</p>,
        canRetry: false,
      };
    case 'RATE_LIMITED':
      return { icon: Timer, title: 'Too many requests', message: <p>TMDB is rate limiting us. Wait a moment and try again.</p>, canRetry: true };
    case 'NETWORK':
      return { icon: WifiOff, title: "Can't reach TMDB", message: <p>Check your internet connection and try again.</p>, canRetry: true };
    default:
      return {
        icon: ServerCrash,
        title: 'Something went wrong',
        message: <p>{error?.message ?? 'The movie data could not be loaded.'}</p>,
        canRetry: true,
      };
  }
}

export default function ErrorMessage({ error, onRetry, compact = false }) {
  const { icon, title, message, canRetry } = describe(error);
  return (
    <div role="alert">
      <EmptyState
        icon={icon}
        title={title}
        message={message}
        compact={compact}
        tone="error"
        action={
          canRetry && onRetry ? (
            <button type="button" className="btn btn--secondary" onClick={onRetry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          ) : null
        }
      />
    </div>
  );
}
