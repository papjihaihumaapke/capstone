import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function BottomNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const nav = useNavigate();
  const { user } = useAppContext();
  const p = location.pathname;
  if (!user) return null;

  const isActive = (path: string) => p.startsWith(path);

  const NavItem = ({ path, label, icon }: { path: string; label: string; icon: React.ReactNode }) => {
    const active = isActive(path);
    return (
      <Link to={path} className="flex flex-col items-center gap-1 cursor-pointer no-underline">
        <div className={`w-5 h-5 flex items-center justify-center ${active ? 'stroke-dark' : 'stroke-muted'}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-medium ${active ? 'text-dark' : 'text-muted'}`}>
          {label}
        </span>
        {active && <div className="w-1 h-1 rounded-full bg-orange mt-0.5" />}
      </Link>
    );
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around px-4 pt-3 pb-5 z-30 ${className}`}>
      
      {/* Home */}
      <NavItem 
        path="/home" 
        label="Home" 
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        } 
      />

      {/* Calendar */}
      <NavItem 
        path="/calendar" 
        label="Calendar" 
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        } 
      />

      {/* Centre Add Button */}
      <button
        onClick={() => nav('/add')}
        aria-label="Add item"
        className="w-11 h-11 bg-dark rounded-btn -mt-4 flex items-center justify-center shrink-0 cursor-pointer shadow-none"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Analytics */}
      <NavItem
        path="/analytics"
        label="Analytics"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
        }
      />

      {/* Settings */}
      <NavItem 
        path="/settings" 
        label="Settings" 
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        } 
      />

    </nav>
  );
}
