function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: { background: '#f3f4f6', color: '#374151' },
    green: { background: '#dcfce7', color: '#166534' },
    yellow: { background: '#fef9c3', color: '#854d0e' },
    red: { background: '#fee2e2', color: '#991b1b' },
  };

  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        ...colors[color],
      }}
    >
      {children}
    </span>
  );
}

export default Badge;