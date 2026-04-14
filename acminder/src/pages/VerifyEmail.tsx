import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate('/signup');
    return null;
  }

  return (
    <AuthLayout backPath="/signup" title="Verify your email" subtitle="One last step">
      <div className="flex flex-col items-center text-center py-4 gap-5">
        <div className="w-14 h-14 rounded-[16px] bg-dark/5 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        <div>
          <h2 className="text-[22px] font-semibold text-dark mb-2">Check your inbox</h2>
          <p className="text-[14px] text-secondary leading-relaxed max-w-[280px]">
            A verification link was sent to{' '}
            <strong className="text-dark font-medium">{email}</strong>.
            Click it to activate your account.
          </p>
        </div>

        <div className="w-full space-y-2.5 mt-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-dark text-white py-3.5 rounded-[12px] text-[14px] font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-surface border border-border text-dark py-3.5 rounded-[12px] text-[14px] font-medium hover:bg-appbg transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
