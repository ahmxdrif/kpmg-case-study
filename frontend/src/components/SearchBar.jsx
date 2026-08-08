function SearchBar({ value, onChange, onSearch, placeholder = 'Search...' }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          padding: '8px 12px',
          marginTop: 12,
          marginBottom: 12,
          borderRadius: 20,
          border: '1px solid var(--border)',
          width: 240,
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      />
      <button
        onClick={onSearch}
        style={{
          padding: '8px 16px',
          marginTop: 12,
          marginBottom: 12,
          borderRadius: 20,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;