/** CineTrack wordmark. `compact` shows only the icon. */
export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--accent)" />
        <path
          d="M21.5 11a7.2 7.2 0 1 0 0 10"
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="22.4" cy="16" r="2.1" fill="var(--accent-ink)" />
      </svg>
      {!compact && (
        <span className="logo__text">
          Cine<span>Track</span>
        </span>
      )}
    </span>
  );
}
