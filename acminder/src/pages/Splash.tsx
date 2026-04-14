import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Sparkles } from 'lucide-react';

const FEATURES = [
  { Icon: Zap, label: 'Instant Detection', bg: 'bg-orange/10', text: 'text-orange' },
  { Icon: Sparkles, label: 'AI Suggestions', bg: 'bg-dark/5', text: 'text-dark' },
  { Icon: Shield, label: 'Conflict-Free', bg: 'bg-dark/5', text: 'text-dark' },
];

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[480px] mx-auto bg-appbg animate-fadeIn">
      
      {/* Hero Section */}
      <div className="px-6 pt-24 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-surface rounded-full px-4 py-2 mb-8 border border-border">
          <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span className="text-dark text-[11px] font-bold uppercase tracking-widest">Acminder AI</span>
        </div>

        <h1 className="text-h1 font-display text-dark leading-tight mb-4">
          No More<br />
          <span className="text-orange">Schedule</span><br />
          Conflicts.
        </h1>

        <p className="text-body font-body text-secondary max-w-[280px] leading-relaxed">
          Spot clashes between your college classes and work shifts before they become a problem.
        </p>
      </div>

      {/* Preview Graphic */}
      <div className="px-6 -mt-2 relative z-10">
        <div className="bg-surface rounded-card shadow-none border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-label font-bold text-muted uppercase tracking-wider">Today's Schedule</span>
            <div className="flex gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-border" />
               <div className="w-1.5 h-1.5 rounded-full bg-border" />
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Conflict Item */}
            <div className="flex items-center gap-3 p-3.5 bg-peach rounded-card border border-peachborder">
              <div className="flex-1 min-w-0">
                <div className="text-bodybold text-dark truncate">Store Shift</div>
                <div className="text-caption text-secondary mt-1">9:00 – 1:00 PM · Work</div>
              </div>
              <span className="text-[10px] bg-white border border-peachborder text-orange font-bold px-2 py-0.5 rounded-badge uppercase">Overlap</span>
            </div>

            {/* Conflict Item */}
            <div className="flex items-center gap-3 p-3.5 bg-peach rounded-card border border-peachborder">
              <div className="flex-1 min-w-0">
                <div className="text-bodybold text-dark truncate">College Class</div>
                <div className="text-caption text-secondary mt-1">11:00 AM – 1:00 PM · Room 204</div>
              </div>
              <span className="text-[10px] bg-white border border-peachborder text-orange font-bold px-2 py-0.5 rounded-badge uppercase">Overlap</span>
            </div>

            {/* Normal Item */}
            <div className="flex items-center gap-3 p-3.5 bg-surface rounded-card border border-border">
              <div className="flex-1 min-w-0">
                <div className="text-bodybold text-dark truncate">Final Essay</div>
                <div className="text-caption text-secondary mt-1">Friday · Tasks</div>
              </div>
              <span className="text-[10px] bg-appbg text-muted font-bold px-2 py-0.5 rounded-badge uppercase">Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex gap-2.5 mt-10 px-6 justify-center flex-wrap">
        {FEATURES.map(({ Icon, label, bg, text }) => (
          <div key={label} className={`flex items-center gap-2 px-4 py-2.5 rounded-btn text-caption font-bold ${bg} ${text} border border-border/50`}>
            <Icon size={14} />
            {label}
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="flex flex-col gap-3 mt-auto px-6 pb-12 pt-8">
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-dark text-white rounded-btn font-display font-bold text-body transition-all active:scale-[0.98] hover:opacity-90 shadow-none uppercase tracking-widest"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-center text-muted font-body text-caption py-2 hover:text-dark transition-colors font-bold uppercase tracking-widest"
        >
          Already registered? <span className="text-dark">Sign in</span>
        </button>
      </div>
    </div>
  );
}
