import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
  { id: 1, title: 'Smart', desc: 'Never miss a deadline again' },
  { id: 2, title: 'Gentle', desc: 'Conflict alerts before they happen' },
  { id: 3, title: 'Flexible', desc: 'Works with your college and work schedule' }
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
          <span className="font-display font-medium text-primary opacity-60">
            Slide {current + 1} Illustration
          </span>
        </div>
      </div>

      {/* Text Content with Fade Transition */}
      <div className="mt-12 h-28 relative">
        {SLIDES.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 w-full transition-all duration-500 ease-out flex flex-col items-center text-center ${current === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
          >
            <h2 className="text-3xl font-display font-bold text-textPrimary mb-3">{slide.title}</h2>
            <p className="text-base font-body text-textSecondary max-w-[280px] leading-relaxed">{slide.desc}</p>
          </div>
        ))}
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
