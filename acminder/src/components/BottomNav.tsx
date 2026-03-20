import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function BottomNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const { user } = useAppContext();
  const currentPath = location.pathname;
  if (!user) return null;

  const TABS = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-30 px-6 flex items-center justify-between ${className}`}>
      {TABS.map((tab) => {
        const isActive = currentPath === tab.path;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors relative ${
              isActive ? 'text-[#F07B5A]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-body ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
