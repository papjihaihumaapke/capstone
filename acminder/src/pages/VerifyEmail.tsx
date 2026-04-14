import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
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
    <AuthLayout backPath="/signup" title="Verify Inbox" subtitle="Check your email">
      <div className="flex flex-col items-center text-center mt-4 mb-8">
        <div className="w-16 h-16 bg-appbg border border-border rounded-badge flex items-center justify-center mb-6">
          <Mail size={32} className="text-dark" />
        </div>
        <h1 className="text-h1 font-display text-dark leading-tight mb-4">
          Check your <span className="text-orange">Email</span>
        </h1>
        <p className="text-body font-body text-secondary max-w-sm">
          A verification link has been sent to <span className="font-bold text-dark">{email}</span>. 
          Please click it to activate your account.
        </p>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="w-full bg-dark text-white py-4 rounded-btn font-display font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-none uppercase tracking-widest"
      >
        <ArrowLeft size={18} />
        Back to Login
      </button>
    </AuthLayout>
  );
}
