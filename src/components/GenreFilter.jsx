/**
 * Row of genre "chips". `selected` is a genre id or null for "All".
 * Optional `counts` (Map of id → number) shows how many movies match.
 */
export default function GenreFilter({ genres, selected, onSelect, counts, label = 'Filter by genre' }) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      <button
        type="button"
        className={`chip ${selected === null ? 'is-active' : ''}`}
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          className={`chip ${selected === genre.id ? 'is-active' : ''}`}
          aria-pressed={selected === genre.id}
          onClick={() => onSelect(genre.id)}
        >
          {genre.name}
          {counts?.has(genre.id) && <span className="chip__count">{counts.get(genre.id)}</span>}
        </button>
      ))}
    </div>
  );
}
