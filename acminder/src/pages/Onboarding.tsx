import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  { id: 1, title: 'Import Schedules', desc: 'Upload your class timetable and work shifts by picking your exported .ics files.', image: '/onboarding_smart.png' },
  { id: 2, title: 'Detect Conflicts', desc: 'AcMinder instantly scans your calendars and highlights overlapping events or tight deadlines.', image: '/onboarding_gentle.png' },
  { id: 3, title: 'Resolve with AI', desc: 'Get smart, actionable suggestions on how to shuffle your tasks and fix schedule conflicts.', image: '/onboarding_flexible.png' }
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current === SLIDES.length - 1) navigate('/signup');
    else setCurrent(c => c + 1);
  };

  return (
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-background px-6 pt-12 pb-10">
      
      {/* Swipeable Illustration Area */}
      <div className="flex-1 flex items-center justify-center pt-8">
        <div className="w-full aspect-square max-h-72 rounded-[2rem] bg-[#FFF0EC] relative flex items-center justify-center transform transition-all duration-300 ease-out shadow-sm overflow-hidden">
          {SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${current === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            />
          ))}
        </div>
      </div>

      {/* Text Content with Fade Transition */}
      <div className="mt-12 h-28 flex flex-col items-center text-center px-4">
        <h2 
          key={`title-${current}`}
          className="text-3xl font-display font-bold text-textPrimary mb-3 animate-fadeIn"
        >
          {SLIDES[current].title}
        </h2>
        <p 
          key={`desc-${current}`}
          className="text-base font-body text-textSecondary max-w-[280px] leading-relaxed animate-fadeIn"
        >
          {SLIDES[current].desc}
        </p>
      </div>

      {/* Navigation & Indicators */}
      <div className="mt-8 flex items-center justify-between pb-4">
        <div className="flex gap-2.5">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2.5 rounded-full transition-all duration-300 ${current === idx ? 'w-8 bg-primary' : 'w-2.5 bg-gray-200'}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center transition-transform active:scale-[0.95] shadow hover:shadow-md"
        >
          <ArrowRight size={24} />
        </button>
      </div>

    </div>
  );
}
