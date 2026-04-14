import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Zap, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    step: '01',
    title: 'Import your life',
    desc: 'Sync your college timetable, work shifts, and personal habits in seconds.',
    graphic: Slide1,
  },
  {
    step: '02',
    title: 'Identify clashes',
    desc: 'Acminder scans everything and highlights every overlap and tight transition.',
    graphic: Slide2,
  },
  {
    step: '03',
    title: 'Resolve with AI',
    desc: 'Get smart suggestions to fix conflicts before they impact your day.',
    graphic: Slide3,
  },
];

function Slide1() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-12 h-12 rounded-[14px] bg-dark/8 flex items-center justify-center mb-1">
        <Upload size={22} className="text-dark" />
      </div>
      <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
        {[
          { label: 'MATH 301',    sub: '9:00 AM · Mon/Wed',  accent: '#1A1A1A' },
          { label: 'Store Shift', sub: '12:00 PM · Tue/Thu',  accent: '#E55B45' },
          { label: 'CS Project',  sub: 'Due Friday',          accent: '#A8A8A8' },
        ].map(({ label, sub, accent }) => (
          <div key={label}
            className="flex items-center gap-3 bg-surface rounded-[12px] px-4 py-3"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.07)', borderLeft: `3px solid ${accent}` }}>
            <div>
              <p className="text-[13px] font-medium text-dark">{label}</p>
              <p className="text-[11px] text-muted mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="flex flex-col items-center w-full max-w-[260px] gap-3">
      {/* Overlapping cards */}
      <div className="relative w-full h-[110px]">
        <div className="absolute top-0 left-0 w-[200px] bg-peach rounded-[12px] px-4 py-3.5"
          style={{ boxShadow: '0 0 0 1px rgba(229,91,69,0.20)' }}>
          <p className="text-[13px] font-medium text-dark">Store Shift</p>
          <p className="text-[11px] text-orange/80 mt-0.5">10:00 AM – 2:00 PM</p>
        </div>
        <div className="absolute top-9 left-8 w-[200px] bg-surface rounded-[12px] px-4 py-3.5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.07)' }}>
          <p className="text-[13px] font-medium text-dark">College Class</p>
          <p className="text-[11px] text-muted mt-0.5">11:00 AM – 1:00 PM</p>
        </div>
        {/* Conflict badge */}
        <div className="absolute -top-2 right-0 w-8 h-8 bg-orange rounded-full flex items-center justify-center"
          style={{ boxShadow: '0 0 0 3px #EFEEEA' }}>
          <Zap size={14} className="text-white" />
        </div>
      </div>
      {/* Detection label */}
      <div className="flex items-center gap-2 bg-orange/10 rounded-badge px-3.5 py-2 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
        <span className="text-[11px] font-semibold text-orange">Overlap detected · 11:00–1:00 PM</span>
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[240px]">
      {/* AI card */}
      <div className="bg-surface rounded-[14px] p-4"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-[8px] bg-dark/8 flex items-center justify-center">
            <Sparkles size={13} className="text-dark" />
          </div>
          <span className="text-[12px] font-semibold text-dark">AI Suggestion</span>
        </div>
        <p className="text-[13px] text-secondary leading-relaxed">
          Move <strong className="text-dark">Store Shift</strong> to{' '}
          <strong className="text-orange">2:00 PM</strong> to eliminate the clash.
        </p>
      </div>
      {/* Options row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-surface rounded-[12px] p-3 text-center"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.07)' }}>
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Option A</p>
          <p className="text-[14px] font-semibold text-dark mt-1">2:00 PM</p>
        </div>
        <div className="rounded-[12px] p-3 text-center"
          style={{ background: '#FDF1EF', boxShadow: '0 0 0 1px rgba(229,91,69,0.18)' }}>
          <p className="text-[10px] text-orange font-medium uppercase tracking-wider">Option B</p>
          <p className="text-[14px] font-semibold text-orange mt-1">4:00 PM</p>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[current];
  const Graphic = slide.graphic;

  const handleNext = () => {
    if (current === SLIDES.length - 1) navigate('/signup');
    else setCurrent(c => c + 1);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-appbg">
      <div className="flex-1 flex flex-col max-w-[480px] mx-auto w-full px-6">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-8">
          {/* Progress dots */}
          <div className="flex gap-2 items-center">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`rounded-full transition-all duration-300 ${
                  current === idx ? 'w-6 h-2 bg-dark' : 'w-2 h-2 bg-border'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="text-[13px] text-muted font-medium hover:text-dark transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Step number */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-6">
          Step {slide.step} of 03
        </p>

        {/* Graphic tile */}
        <div
          key={`graphic-${current}`}
          className="bento-tile flex items-center justify-center min-h-[240px] animate-fadeIn"
        >
          <Graphic />
        </div>

        {/* Text */}
        <div key={`text-${current}`} className="mt-8 animate-fadeIn">
          <h2 className="text-[28px] font-semibold text-dark leading-tight mb-3">
            {slide.title}
          </h2>
          <p className="text-[15px] text-secondary leading-relaxed">
            {slide.desc}
          </p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-auto py-10">
          {current > 0 ? (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="px-5 py-2.5 rounded-[10px] bg-surface text-[13px] font-medium text-dark hover:bg-border/30 transition-colors"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
            >
              Back
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-dark text-white text-[14px] font-medium hover:opacity-90 active:scale-[0.97] transition-all ml-auto"
          >
            {current === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
