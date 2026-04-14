import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backPath?: string;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, backPath, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col bg-appbg">
      {/* Top section */}
      <div className="flex-[0.6] flex flex-col justify-center items-start px-6 pt-16 relative">
        <button
          onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
          className="absolute top-12 left-6 w-9 h-9 bg-surface rounded-btn border border-border flex items-center justify-center hover:bg-appbg active:scale-95 transition-all text-dark"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-h1 font-display text-dark mt-12 mb-2">Acminder</h1>
        <p className="text-body text-muted">{title || "Manage your time better."}</p>
        
        {subtitle && <p className="text-caption text-muted mt-1">{subtitle}</p>}

        <div className="w-10 h-1 bg-orange rounded mt-4" />
      </div>

      {/* Bottom section (Form) */}
      <div className="flex-shrink-0 bg-surface rounded-t-[32px] px-6 py-8 shadow-none border-t border-border">
        {children}
      </div>
    </div>
  );
}
