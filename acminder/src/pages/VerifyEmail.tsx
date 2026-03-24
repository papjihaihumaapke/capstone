import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { supabase, ensureProfileExists } from '../lib/supabase';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If there's no email in state, the user probably navigated here directly
  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length < 6) return;

    setLoading(true);
    setError('');

    const { data, error: vError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (vError) {
      setError(vError.message);
      setLoading(false);
      return;
    }

    if (data?.session?.user) {
      await ensureProfileExists(data.session.user.id, data.session.user.email || '');
      navigate('/import');
    } else {
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    if (resendError) {
      setError(resendError.message);
    } else {
      setError("Code resent successfully!");
    }
  };

  return (
    <AuthLayout backPath="/signup">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-textPrimary leading-tight">
          Verify <span className="text-primary">Email</span>
        </h1>
        <p className="text-base text-textSecondary font-body mt-2">
          We sent a 6-digit code to <span className="font-semibold text-textPrimary">{email}</span>. Enter it below.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textPrimary">6-Digit Code</span>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg tracking-[0.2em] font-mono text-textPrimary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 placeholder:tracking-normal"
          />
        </label>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading || token.length < 6}
            className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold transition-transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-sm"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          
          {error && (
            <div className={`p-3 text-sm font-medium rounded-lg text-center border ${error.includes('successfully') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {error}
            </div>
          )}
        </div>
        
        <div className="text-center mt-2">
          <p className="text-sm text-textSecondary">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-primary font-semibold hover:underline"
            >
              Resend Code
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
