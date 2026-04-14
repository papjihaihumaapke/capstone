import SidebarNav from './SidebarNav';
import BottomNav from './BottomNav';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-appbg">
      <SidebarNav className="hidden lg:flex" />
      <BottomNav className="flex lg:hidden" />
      <main className="lg:ml-[220px] pb-24 lg:pb-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
