import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backPath?: string;
}

export default function AuthLayout({ children, backPath }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col bg-card w-full max-w-[390px] mx-auto relative shadow-sm">
      {/* Top Header Row */}
      <div className="absolute top-0 left-0 w-full px-4 pt-10 pb-4 flex items-center z-10">
        <button 
          onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
          className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-textSecondary"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-6 py-20 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
