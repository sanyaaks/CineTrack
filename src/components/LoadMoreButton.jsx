import { LoaderCircle } from 'lucide-react';

/** "Load more" button, or an end-of-list note when there is nothing left. */
export default function LoadMoreButton({ onClick, loading, hasMore }) {
  if (!hasMore) return <p className="list-end">You've reached the end of the list.</p>;

  return (
    <div className="load-more">
      <button type="button" className="btn btn--secondary btn--wide" onClick={onClick} disabled={loading}>
        {loading && <LoaderCircle size={18} className="spin" aria-hidden="true" />}
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  );
}
