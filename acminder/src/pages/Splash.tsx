import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Sparkles } from 'lucide-react';

const FEATURES = [
  { Icon: Zap, label: 'Instant Detection', color: 'bg-primary/10 text-primary' },
  { Icon: Sparkles, label: 'AI Suggestions', color: 'bg-accent/10 text-accent' },
  { Icon: Shield, label: 'Conflict-Free', color: 'bg-tagGreen/10 text-tagGreen' },
];

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-background relative overflow-hidden">
      {/* Blue gradient hero */}
      <div className="bg-blue-gradient px-6 pt-16 pb-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 -right-4 w-24 h-24 rounded-full bg-white/8" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white/90 text-xs font-semibold">Smart Life Manager</span>
          </div>

          <h1 className="text-5xl font-display font-bold leading-tight tracking-tight text-white">
            No More<br />
            <span className="text-accent">Schedule</span><br />
            Conflicts.
          </h1>

          <p className="mt-4 text-base font-body text-white/75 max-w-[280px] leading-relaxed">
            Spot clashes between your college classes and work shifts before they become a problem.
          </p>
        </div>
      </div>

      {/* Schedule block graphic */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-elevated p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Today's Schedule</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 bg-primaryLight rounded-xl border-l-4 border-primary">
              <div className="flex-1">
                <div className="text-xs font-bold text-primary">Store Shift</div>
                <div className="text-[10px] text-primary/70 mt-0.5">9:00 – 1:00 PM · Work</div>
              </div>
              <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">Overlap</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accentLight rounded-xl border-l-4 border-accent">
              <div className="flex-1">
                <div className="text-xs font-bold text-accent">College Class</div>
                <div className="text-[10px] text-accent/70 mt-0.5">11:00 AM – 1:00 PM · Room 204</div>
              </div>
              <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded-full">Overlap</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border-l-4 border-border">
              <div className="flex-1">
                <div className="text-xs font-bold text-textPrimary">Final Essay</div>
                <div className="text-[10px] text-textSecondary mt-0.5">Friday · Tasks</div>
              </div>
              <span className="text-[10px] bg-warning/10 text-warning font-bold px-2 py-0.5 rounded-full">Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature chips */}
      <div className="flex gap-2 mt-6 px-6 justify-center flex-wrap">
        {FEATURES.map(({ Icon, label, color }) => (
          <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${color} bg-opacity-10`}>
            <Icon size={13} />
            {label}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 mt-auto px-6 pb-10 pt-6">
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-primary text-white rounded-2xl font-display font-semibold text-base transition-all active:scale-[0.98] shadow-blue hover:bg-primaryDark"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-center text-textSecondary font-body text-sm py-2 hover:text-primary transition-colors font-medium"
        >
          Already have an account? <span className="text-primary font-semibold">Sign in</span>
        </button>
      </div>
    </div>
  );
}
