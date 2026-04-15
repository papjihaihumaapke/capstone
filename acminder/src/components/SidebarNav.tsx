import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Plus, Settings, Upload, User, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TABS = [
  { name: 'Home',      path: '/home',      icon: Home },
  { name: 'Calendar',  path: '/calendar',  icon: CalendarDays },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Import',    path: '/import',    icon: Upload },
  { name: 'Profile',   path: '/profile',   icon: User },
  { name: 'Settings',  path: '/settings',  icon: Settings },
];

export default function SidebarNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { user, conflictCount } = useAppContext();
  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!user) return null;

  const displayName = user.name || (user.email?.split('@')[0] || 'User');
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className={`fixed left-0 top-0 h-full w-[220px] z-40 bg-surface flex flex-col ${className}`}
      style={{ boxShadow: '1px 0 0 rgba(0,0,0,0.07)' }}>

      {/* Brand */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-dark flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-[13px] tracking-tight">A</span>
          </div>
          <span className="text-[15px] font-semibold text-dark tracking-tight">Acminder</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {/* Add Item — primary CTA */}
        <Link
          to="/add"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-dark text-white mb-3 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="text-[13px] font-medium">Add Item</span>
        </Link>

        {TABS.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors relative ${
                active
                  ? 'bg-appbg text-dark font-medium'
                  : 'text-secondary hover:bg-appbg hover:text-dark'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[13px]">{tab.name}</span>
              {tab.path === '/home' && conflictCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] bg-orange text-white text-[10px] font-semibold rounded-badge flex items-center justify-center px-1">
                  {conflictCount > 9 ? '9+' : conflictCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-6 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-appbg border border-border flex items-center justify-center shrink-0">
            <span className="text-dark font-semibold text-[11px]">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-dark truncate">{displayName}</p>
            <p className="text-[10px] text-muted truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
