import { useState } from 'react';

function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }) {
  const [hovered, setHovered] = useState(false);

  const baseStyles = {
    primary: { background: '#2563eb', color: '#fff' },
    secondary: { background: '#e5e7eb', color: '#111' },
    danger: { background: '#dc2626', color: '#fff' },
  };

  const hoverStyles = {
    primary: { background: '#1d4ed8' },
    secondary: { background: '#d1d5db' },
    danger: { background: '#b91c1c' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: 14,
        fontWeight: 500,
        transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
        boxShadow: hovered && !disabled ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        ...baseStyles[variant],
        ...(hovered && !disabled ? hoverStyles[variant] : {}),
      }}
    >
      {children}
    </button>
  );
}

export default Button;