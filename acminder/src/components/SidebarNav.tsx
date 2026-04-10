import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Plus, Settings, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TABS = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  { name: 'Add Item', path: '/add', icon: Plus },
  { name: 'Import', path: '/import', icon: Upload },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function SidebarNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { user } = useAppContext();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath.startsWith(path);

  if (!user) return null;

  return (
    <aside className={`fixed left-0 top-0 h-full w-[220px] z-40 bg-white border-r border-border flex flex-col ${className}`}>
      {/* Brand */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center shadow-blue">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-textPrimary">Acminder</h1>
            <p className="text-[10px] text-textSecondary">Schedule Manager</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {TABS.map((tab) => {
            const active = isActive(tab.path);
            const Icon = tab.icon;
            const isAdd = tab.path === '/add';
            return (
              <li key={tab.name}>
                <Link
                  to={tab.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isAdd
                      ? 'bg-primary text-white hover:bg-primaryDark shadow-blue'
                      : active
                      ? 'bg-primaryLight text-primary font-semibold'
                      : 'text-textSecondary hover:bg-surface hover:text-textPrimary'
                  }`}
                >
                  <Icon size={18} strokeWidth={active || isAdd ? 2.5 : 2} />
                  <span className="text-sm font-medium">{tab.name}</span>
                  {active && !isAdd && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primaryLight flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {user.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-textPrimary truncate">{user.email?.split('@')[0]}</p>
            <p className="text-[10px] text-textSecondary truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
