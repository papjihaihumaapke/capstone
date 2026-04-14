import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Zap, Sparkles } from 'lucide-react';

function SlideGraphic({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-badge bg-appbg border border-border flex items-center justify-center">
            <Upload size={24} className="text-dark" />
          </div>
          <div className="flex flex-col gap-2.5 w-52">
            {[
              { title: 'College', time: '9:00 AM', color: 'border-dark bg-appbg' },
              { title: 'Work', time: '12:00 PM', color: 'border-orange bg-peach' },
              { title: 'Tasks', time: 'Friday', color: 'border-muted bg-surface' },
            ].map(({ title, time, color }) => (
              <div key={title} className={`flex items-center gap-3 bg-white rounded-card px-4 py-3 border-l-4 border-y border-r border-y-border border-r-border shadow-none ${color}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-caption font-bold text-dark truncate">{title}</div>
                  <div className="text-[10px] text-muted mt-0.5">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-56">
          <div className="absolute top-0 left-0 w-48 h-16 rounded-card bg-peach border border-peachborder flex items-center px-4">
            <div>
              <div className="text-caption font-bold text-peachtext">Work</div>
              <div className="text-[10px] text-peachtext/70 mt-0.5">10:00 – 2:00 PM</div>
            </div>
          </div>
          <div className="absolute top-8 left-6 w-48 h-16 rounded-card bg-surface border border-border flex items-center px-4">
            <div>
              <div className="text-caption font-bold text-dark">College</div>
              <div className="text-[10px] text-muted mt-0.5">11:00 AM – 1:00 PM</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange flex items-center justify-center ring-4 ring-white">
            <Zap size={14} className="text-white" />
          </div>
          <div className="mt-28 ml-1">
            <div className="inline-flex items-center gap-2 bg-peach border border-peachborder rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange" />
              <span className="text-[10px] font-bold text-orange uppercase tracking-wider">Overlap Detected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-56 flex flex-col gap-3">
        <div className="bg-surface rounded-card p-4 border border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-badge bg-appbg flex items-center justify-center">
              <Sparkles size={14} className="text-dark" />
            </div>
            <span className="text-caption font-bold text-dark uppercase tracking-wider">AI Insight</span>
          </div>
          <p className="text-caption text-secondary leading-relaxed">
            Move <span className="font-bold text-dark">Work</span> to <span className="font-bold text-orange">2:00 PM</span> to fix the clash.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-surface rounded-card p-2 text-center border border-border">
            <div className="text-[9px] text-muted font-bold uppercase">Option 1</div>
            <div className="text-caption font-bold text-dark mt-0.5">2:00 PM</div>
          </div>
          <div className="flex-1 bg-peach rounded-card p-2 text-center border border-peachborder">
            <div className="text-[9px] text-orange font-bold uppercase">Option 2</div>
            <div className="text-caption font-bold text-orange mt-0.5">4:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { title: 'Import Life', desc: 'Sync your college timetable, work shifts, and personal habits effortlessly.', step: '01' },
  { title: 'Identify Clashes', desc: 'Acminder scans your schedule to highlight overlaps and tight transitions.', step: '02' },
  { title: 'Resolve with AI', desc: 'Get intelligent suggestions to fix conflicts before they impact your day.', step: '03' },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current === SLIDES.length - 1) navigate('/signup');
    else setCurrent(c => c + 1);
  };

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[480px] mx-auto bg-appbg animate-fadeIn">
      
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === idx ? 'w-8 bg-orange' : 'w-4 bg-border'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/signup')}
          className="text-caption text-muted font-bold hover:text-dark transition-colors uppercase tracking-wider"
        >
          Skip
        </button>
      </div>

      {/* Graphic Container */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full aspect-square max-h-[320px] rounded-card bg-surface border border-border relative overflow-hidden p-6 flex items-center justify-center">
          <div className="absolute top-4 left-4 text-h3 font-display text-border">
            {slide.step}
          </div>
          <SlideGraphic index={current} />
        </div>
      </div>

      {/* Text content */}
      <div className="px-8 mt-12 mb-8">
        <h2
          key={`title-${current}`}
          className="text-h1 font-display text-dark mb-4 animate-fadeIn"
        >
          {slide.title}
        </h2>
        <p
          key={`desc-${current}`}
          className="text-body font-body text-secondary leading-relaxed animate-fadeIn"
        >
          {slide.desc}
        </p>
      </div>

      {/* Navigation */}
      <div className="px-8 pb-12 flex items-center justify-between">
        {current > 0 ? (
          <button
            onClick={() => setCurrent(c => c - 1)}
            className="h-14 px-6 rounded-btn border border-border text-dark font-bold text-caption hover:bg-surface transition-colors uppercase tracking-wider"
          >
            Back
          </button>
        ) : <div />}

        <button
          onClick={handleNext}
          className="h-14 w-14 rounded-btn bg-dark text-white flex items-center justify-center transition-all active:scale-[0.9] hover:opacity-90 shadow-none ml-auto"
        >
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
}
