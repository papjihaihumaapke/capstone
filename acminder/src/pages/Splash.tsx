import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-background px-6 pt-16 pb-12 relative overflow-hidden">
      
      {/* Header Topic */}
      <h1 className="text-4xl font-display font-bold leading-tight tracking-tight text-textPrimary max-w-[280px]">
        Your Smart<br />
        <span className="text-primary">Assistant.</span>
      </h1>
      
      <p className="mt-4 text-base font-body text-textSecondary max-w-[260px] leading-relaxed">
        Stay on top of tasks, deadlines and important events effortlessly.
      </p>

      {/* Classroom Illustration */}
      <div className="flex-1 flex flex-col justify-center items-center py-10">
        <div className="w-full aspect-square max-h-64 rounded-3xl overflow-hidden shadow-sm">
          <img
            src="/splash_classroom.png"
            alt="Classroom illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {['Smart', 'Gentle', 'Flexible'].map((tag) => (
          <span key={tag} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-body font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4 mt-auto">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 bg-primary text-white rounded-full font-display font-semibold text-lg transition-transform active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          Get Started
        </button>
        
        <button 
          onClick={() => navigate('/login')}
          className="w-full text-center text-textSecondary font-body text-sm py-2 hover:text-textPrimary transition-colors"
        >
          I already have an account
        </button>
      </div>

    </div>
  );
}
