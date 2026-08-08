import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/timesheets', label: 'Timesheets' },
  { to: '/consultants', label: 'Consultants' },
  { to: '/clients', label: 'Clients' },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <div
      style={{
        width: collapsed ? 64 : 220,
        transition: 'width 0.2s ease',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 'none',
          padding: 16,
          cursor: 'pointer',
          fontSize: 18,
          textAlign: 'left',
          color: 'var(--text)',
        }}
      >
        {collapsed ? '☰' : '☰  PRM'}
      </button>

      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 20,
              marginBottom: 4,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text)',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;