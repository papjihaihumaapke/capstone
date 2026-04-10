import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Zap, Sparkles } from 'lucide-react';

function SlideGraphic({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
            <Upload size={30} className="text-primary" />
          </div>
          <div className="flex flex-col gap-2 w-52">
            {[
              { title: 'College', time: '9:00 – 11:00 AM', color: 'border-primary bg-primaryLight' },
              { title: 'Work', time: '12:00 – 4:00 PM', color: 'border-accent bg-accentLight' },
              { title: 'Tasks', time: 'Friday', color: 'border-warning bg-warning/5' },
              { title: 'Habits', time: 'Daily · 7:00 AM', color: 'border-indigo-500 bg-indigo-50' },
            ].map(({ title, time, color }) => (
              <div key={title} className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-card border-l-4 ${color}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-textPrimary truncate">{title}</div>
                  <div className="text-[10px] text-textSecondary mt-0.5">{time}</div>
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
          <div className="absolute top-0 left-0 w-48 h-16 rounded-2xl bg-primaryLight border-l-4 border-primary flex items-center px-4 shadow-card">
            <div>
              <div className="text-[11px] font-bold text-primary">Work</div>
              <div className="text-[10px] text-primary/70 mt-0.5">10:00 – 2:00 PM</div>
            </div>
          </div>
          <div className="absolute top-10 left-6 w-48 h-16 rounded-2xl bg-accentLight border-l-4 border-accent flex items-center px-4 shadow-card">
            <div>
              <div className="text-[11px] font-bold text-accent">College</div>
              <div className="text-[10px] text-accent/70 mt-0.5">11:00 AM – 1:00 PM</div>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-danger flex items-center justify-center shadow-elevated">
            <Zap size={16} className="text-white" />
          </div>
          <div className="mt-28 ml-1">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-xs font-bold text-danger">Overlap · 11:00 – 12:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-56 flex flex-col gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-elevated border border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-gradient flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-xs font-bold text-textPrimary">AI Suggestion</span>
          </div>
          <p className="text-[11px] text-textSecondary leading-relaxed">
            Move your <span className="font-bold text-primary">Work</span> to <span className="font-bold text-primary">2:00 – 6:00 PM</span> to remove the conflict with College.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-primaryLight rounded-xl p-3 text-center border border-primary/10">
            <div className="text-[10px] text-primary/70 font-medium">Alt 1</div>
            <div className="text-xs font-bold text-primary mt-0.5">7:00–11:00 AM</div>
          </div>
          <div className="flex-1 bg-accentLight rounded-xl p-3 text-center border border-accent/10">
            <div className="text-[10px] text-accent/70 font-medium">Alt 2</div>
            <div className="text-xs font-bold text-accent mt-0.5">3:00–7:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    title: 'Import Schedules',
    desc: 'Upload your college timetable, work shifts, tasks, and daily habits — or add them manually.',
    step: '01',
  },
  {
    title: 'Detect Conflicts',
    desc: 'Acminder instantly scans your calendars and highlights overlapping events and tight deadlines.',
    step: '02',
  },
  {
    title: 'Resolve with AI',
    desc: 'Get smart, actionable suggestions to fix schedule clashes before they become a problem.',
    step: '03',
  },
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
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                current === idx ? 'w-8 bg-primary' : current > idx ? 'w-4 bg-primary/40' : 'w-4 bg-border'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigate('/signup')}
          className="text-sm text-textSecondary font-medium hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Graphic */}
      <div className="flex-1 flex items-center justify-center px-6 pt-2">
        <div className="w-full aspect-square max-h-72 rounded-3xl bg-white border border-border shadow-elevated relative overflow-hidden p-6">
          {/* Step badge */}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-blue-gradient flex items-center justify-center">
            <span className="text-white text-xs font-bold">{slide.step}</span>
          </div>
          <SlideGraphic index={current} />
        </div>
      </div>

      {/* Text content */}
      <div className="px-6 mt-8 mb-6">
        <h2
          key={`title-${current}`}
          className="text-3xl font-display font-bold text-textPrimary mb-3 animate-fadeIn"
        >
          {slide.title}
        </h2>
        <p
          key={`desc-${current}`}
          className="text-base font-body text-textSecondary leading-relaxed animate-fadeIn"
        >
          {slide.desc}
        </p>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10 flex items-center justify-between">
        {current > 0 ? (
          <button
            onClick={() => setCurrent(c => c - 1)}
            className="h-12 px-6 rounded-2xl border border-border text-textSecondary font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
          >
            Back
          </button>
        ) : <div />}

        <button
          onClick={handleNext}
          className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center transition-all active:scale-[0.95] shadow-blue hover:bg-primaryDark ml-auto"
        >
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
}
