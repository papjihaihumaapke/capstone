import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Plus, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TABS = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  { name: 'Add', path: '/add', icon: Plus, isAdd: true },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { user } = useAppContext();
  const currentPath = location.pathname;
  if (!user) return null;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-border shadow-[0_-4px_20px_rgba(15,23,42,0.06)] z-30 px-4 flex items-center justify-around ${className}`}>
      {TABS.map((tab) => {
        const isActive = currentPath.startsWith(tab.path);
        const Icon = tab.icon;

        if ((tab as { isAdd?: boolean }).isAdd) {
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-blue active:scale-95 transition-transform"
            >
              <Icon size={22} className="text-white" strokeWidth={2.5} />
            </Link>
          );
        }

        return (
          <Link
            key={tab.name}
            to={tab.path}
            className="flex flex-col items-center gap-1 flex-1 py-1 relative"
          >
            <div className="relative">
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-textSecondary'}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-textSecondary'}`}>
              {tab.name}
            </span>
            {isActive && (
              <span className="absolute -top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
