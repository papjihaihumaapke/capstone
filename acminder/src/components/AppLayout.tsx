import SidebarNav from './SidebarNav';
import BottomNav from './BottomNav';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AppLayout() {
  const { user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const showFab = location.pathname !== '/add';

  return (
    <div className="min-h-dvh bg-background">
      <SidebarNav className="hidden lg:flex" />
      <BottomNav className="flex lg:hidden" />
      {user && showFab && (
        <button
          type="button"
          aria-label="Add item"
          onClick={() => navigate('/add')}
          className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      )}
      <main className="lg:ml-[220px] pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}