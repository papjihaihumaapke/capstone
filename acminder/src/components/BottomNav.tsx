import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function BottomNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const nav = useNavigate();
  const { user } = useAppContext();
  const p = location.pathname;
  if (!user) return null;

  const iconColor = (active: boolean) => active ? '#0D0D0D' : '#BBBBBB';
  const labelColor = (active: boolean) => active ? '#0D0D0D' : '#BBBBBB';

  return (
    <nav
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '0.5px solid #F0F0F0',
        padding: '12px 0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 30,
        fontFamily: '-apple-system, "SF Pro Display", sans-serif',
      }}
    >
      {/* Home */}
      <Link to="/home" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(p.startsWith('/home'))} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 500, color: labelColor(p.startsWith('/home')) }}>Home</span>
      </Link>

      {/* Calendar */}
      <Link to="/calendar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(p.startsWith('/calendar'))} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 500, color: labelColor(p.startsWith('/calendar')) }}>Calendar</span>
      </Link>

      {/* Centre Add button — lifted above bar */}
      <button
        type="button"
        onClick={() => nav('/add')}
        aria-label="Add item"
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: '#0D0D0D',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -18,
          flexShrink: 0,
        }}
      >
        <div style={{ position: 'relative', width: 16, height: 16 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: 16, height: 2, background: '#fff', borderRadius: 2, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: 16, background: '#fff', borderRadius: 2, transform: 'translateX(-50%)' }} />
        </div>
      </button>

      {/* Profile */}
      <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(p.startsWith('/profile'))} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 500, color: labelColor(p.startsWith('/profile')) }}>Profile</span>
      </Link>

      {/* Settings */}
      <Link to="/settings" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor(p.startsWith('/settings'))} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 500, color: labelColor(p.startsWith('/settings')) }}>Settings</span>
      </Link>
    </nav>
  );
}
