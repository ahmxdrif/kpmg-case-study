function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }) {
  const styles = {
    primary: { background: '#2563eb', color: '#fff' },
    secondary: { background: '#e5e7eb', color: '#111' },
    danger: { background: '#dc2626', color: '#fff' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 14,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

export default Button;