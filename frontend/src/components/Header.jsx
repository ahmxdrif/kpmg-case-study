import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() || '?';

  return (
    <header
      style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
        padding: '0 20px',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={toggleTheme}
        title="Toggle dark mode"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {initials}
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 44,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        color: 'var(--text)',
      }}
    >
      {children}
    </button>
  );
}

export default Header;