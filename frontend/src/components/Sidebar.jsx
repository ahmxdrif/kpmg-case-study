import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Sidebar({ collapsed, onToggle }) {
    const { user } = useAuth();
    const navItems = [
    { to: '/dashboard', label: 'Dashboard', allow: ['pm', 'consultant'] },
    { to: '/projects', label: 'Projects', allow: ['pm'] },
    { to: '/tasks', label: 'Tasks', allow: ['pm', 'consultant'] },
    { to: '/timesheets', label: 'Timesheets', allow: ['pm', 'consultant'] },
    { to: '/consultants', label: 'Consultants', allow: ['pm'] },
    { to: '/clients', label: 'Clients', allow: ['pm'] },
    ];

    const visibleItems = navItems.filter((item) => {
      const isPM = user?.is_project_manager && item.allow.includes('pm');
      const isConsultant = user?.is_consultant && item.allow.includes('consultant');
      return isPM || isConsultant;
    });



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
        {visibleItems.map((item) => (
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
              color: !collapsed && isActive ? 'var(--accent)' : 'var(--text)',
              background: !collapsed && isActive ? 'var(--accent-soft)' : 'transparent',
              fontWeight: !collapsed && isActive ? 600 : 400,
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