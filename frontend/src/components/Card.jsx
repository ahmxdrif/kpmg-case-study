import { useState } from 'react';

function Card({ children, style = {}, onClick, clickable: clickableProp }) {
  const [hovered, setHovered] = useState(false);
  const clickable = clickableProp !== undefined ? clickableProp : !!onClick;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => clickable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        background: 'var(--surface)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        borderColor: hovered ? 'var(--accent-soft, #3b82f633)' : 'var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;