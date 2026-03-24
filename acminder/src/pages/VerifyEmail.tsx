import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // If there's no email in state, the user probably navigated here directly
  if (!email) {
    navigate('/signup');
    return null;
  }

  return (
    <AuthLayout backPath="/signup">
      <div className="flex flex-col items-center text-center mt-8 mb-12">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Mail size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-textPrimary leading-tight mb-4">
          Check your <span className="text-primary">email</span>
        </h1>
        <p className="text-base text-textSecondary font-body max-w-sm">
          We've sent a verification link to <span className="font-semibold text-textPrimary">{email}</span>. 
          Please click the link in your email to activate your account.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold transition-transform active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}
