import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backPath?: string;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, backPath, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate();
  const goBack = () => backPath ? navigate(backPath) : navigate(-1);

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">

      {/* ══ LEFT — dark branding panel (desktop only) ══ */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 px-12 py-14"
        style={{ background: '#1A1A1A' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="text-white font-semibold text-[13px]">A</span>
          </div>
          <span className="text-white font-semibold text-[16px] tracking-tight">Acminder</span>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-white text-[34px] font-semibold leading-[1.1] mb-3">
            {title || 'Manage your time better.'}
          </h2>
          {subtitle && (
            <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Schedule preview tiles */}
        <div className="space-y-2.5">
          {[
            { label: 'Store Shift',   time: '9:00 – 1:00 PM',    badge: 'Overlap', overlap: true  },
            { label: 'College Class', time: '11:00 AM – 1:00 PM', badge: 'Overlap', overlap: true  },
            { label: 'Final Essay',   time: 'Due Friday',         badge: 'Task',    overlap: false },
          ].map(item => (
            <div key={item.label}
              className="flex items-center justify-between px-4 py-3 rounded-[12px]"
              style={{
                background: item.overlap ? 'rgba(229,91,69,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${item.overlap ? 'rgba(229,91,69,0.30)' : 'rgba(255,255,255,0.10)'}`,
              }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  {item.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {item.time}
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: item.overlap ? 'rgba(229,91,69,0.25)' : 'rgba(255,255,255,0.10)',
                  color:      item.overlap ? '#FF9070'               : 'rgba(255,255,255,0.60)',
                }}>
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT — form panel ══ */}
      <div className="flex-1 flex flex-col" style={{ background: '#EFEEEA' }}>

        {/* Back button + branding row — same on mobile & desktop */}
        <div className="flex items-center justify-between px-6 lg:px-10 pt-10 pb-0">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
            style={{ color: '#6B6B6B' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B6B6B')}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Logo mark — visible on mobile only */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: '#1A1A1A' }}>
              <span className="text-white font-semibold text-[12px]">A</span>
            </div>
            <span className="font-semibold text-[14px]" style={{ color: '#1A1A1A' }}>Acminder</span>
          </div>
        </div>

        {/* Page title — mobile only (desktop shows title in left panel) */}
        {(title || subtitle) && (
          <div className="lg:hidden px-6 pt-6 pb-2">
            {title    && <h1 className="text-[26px] font-semibold leading-tight" style={{ color: '#1A1A1A' }}>{title}</h1>}
            {subtitle && <p className="text-[14px] mt-1" style={{ color: '#6B6B6B' }}>{subtitle}</p>}
          </div>
        )}

        {/* Form — centered card on desktop, full-width on mobile */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-12 pt-6 pb-12 lg:py-10">
          <div className="w-full max-w-[420px] auth-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
