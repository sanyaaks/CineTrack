import { forwardRef } from 'react';
import { LoaderCircle, Search, X } from 'lucide-react';

/** Large search input with a clear button. Escape also clears it. */
const SearchBar = forwardRef(function SearchBar({ value, onChange, busy = false, placeholder }, ref) {
  return (
    <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <Search className="search-bar__icon" size={22} aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        className="search-bar__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onChange('');
        }}
        placeholder={placeholder ?? 'Search for a movie title…'}
        aria-label="Search movies by title"
        autoComplete="off"
        spellCheck="false"
      />
      {busy && <LoaderCircle className="search-bar__spinner spin" size={20} aria-hidden="true" />}
      {value && (
        <button type="button" className="icon-btn search-bar__clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </form>
  );
});

export default SearchBar;
