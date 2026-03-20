import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, Settings } from 'lucide-react';

export default function SidebarNav({ className = '' }: { className?: string }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`fixed left-0 top-0 h-full w-[220px] z-40 bg-white border-r border-gray-100 flex-col ${className}`}>
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-display font-bold text-primary">Acminder</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/home"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/home') ? 'bg-[#FFF0EC] text-[#F07B5A]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Home size={20} />
              <span className="font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/calendar"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/calendar') ? 'bg-[#FFF0EC] text-[#F07B5A]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Calendar size={20} />
              <span className="font-medium">Calendar</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive('/settings') ? 'bg-[#FFF0EC] text-[#F07B5A]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}