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
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Blue gradient header */}
      <div className="bg-blue-gradient px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/8" />

        <button
          onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
          className="relative z-10 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all text-white mb-6"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-card">
            <span className="text-white font-display font-bold text-lg">A</span>
          </div>
          {title && (
            <h1 className="text-3xl font-display font-bold text-white leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-white/70 font-body text-sm mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-4 relative z-10 pb-8">
        <div className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-elevated p-6 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
