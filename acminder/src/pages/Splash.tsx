import { useNavigate } from 'react-router-dom';
import { Zap, Brain, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { Icon: Zap,         label: 'Instant Detection' },
  { Icon: Brain,       label: 'AI Suggestions'    },
  { Icon: ShieldCheck, label: 'Conflict-Free'      },
];

// Mini preview card shown on both mobile and desktop
function PreviewCard() {
  return (
    <div className="bento-tile space-y-2.5 w-full max-w-[340px]">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Today's Schedule</p>

      {/* Conflict items */}
      {[
        { title: 'Store Shift',    meta: '9:00 – 1:00 PM · Work',             conflict: true  },
        { title: 'College Class',  meta: '11:00 AM – 1:00 PM · Room 204',      conflict: true  },
        { title: 'Final Essay',    meta: 'Friday · Task',                      conflict: false },
      ].map(item => (
        <div key={item.title}
          className={`flex items-center justify-between px-3.5 py-3 rounded-[12px] ${
            item.conflict
              ? 'bg-peach border-l-2 border-orange'
              : 'bg-appbg'
          }`}
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-dark">{item.title}</p>
            <p className={`text-[11px] mt-0.5 ${item.conflict ? 'text-orange/70' : 'text-muted'}`}>{item.meta}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-badge ml-3 shrink-0 ${
            item.conflict ? 'bg-orange/15 text-orange' : 'bg-dark/8 text-muted'
          }`}>
            {item.conflict ? 'Overlap' : 'Task'}
          </span>
        </div>
      ))}

      {/* Conflict banner */}
      <div className="flex items-center gap-2 bg-orange/8 rounded-[10px] px-3.5 py-2.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
        <p className="text-[11px] font-medium text-orange">2 overlapping events detected</p>
      </div>
    </div>
  );
}

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-appbg flex flex-col lg:flex-row">

      {/* ── Left / hero column ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 pt-16 lg:pt-0 max-w-[640px] mx-auto lg:mx-0">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 lg:mb-12">
          <div className="w-8 h-8 rounded-[10px] bg-dark flex items-center justify-center">
            <span className="text-white font-semibold text-[13px]">A</span>
          </div>
          <span className="text-dark font-semibold text-[15px] tracking-tight">Acminder</span>
        </div>

        {/* Headline */}
        <h1 className="text-[40px] lg:text-[52px] font-semibold text-dark leading-[1.05] tracking-tight mb-5">
          No more<br />
          <span className="text-orange">schedule</span><br />
          conflicts.
        </h1>

        <p className="text-[15px] text-secondary leading-relaxed mb-8 max-w-[320px]">
          Spot clashes between your college classes and work shifts before they become a problem.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FEATURES.map(({ Icon, label }) => (
            <div key={label}
              className="flex items-center gap-2 px-3.5 py-2 rounded-badge bg-surface text-[12px] font-medium text-dark"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
              <Icon size={13} className="text-muted" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 max-w-[320px]">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-3.5 bg-dark text-white rounded-[12px] text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-surface text-dark rounded-[12px] text-[14px] font-medium hover:bg-border/30 active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* ── Right / preview column ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0 lg:bg-surface/60">
        <div className="w-full max-w-[340px]">
          {/* Floating label above card */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span className="text-[12px] font-medium text-muted">Live conflict detection</span>
          </div>
          <PreviewCard />
          {/* Stats row below card */}
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            {[
              { n: '2s',   label: 'Scan time'   },
              { n: '98%',  label: 'Accuracy'    },
              { n: 'Free', label: 'Always'       },
            ].map(s => (
              <div key={s.label} className="bento-tile-sm text-center">
                <p className="text-[16px] font-bold text-dark">{s.n}</p>
                <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
