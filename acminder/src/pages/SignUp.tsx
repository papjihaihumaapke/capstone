import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

const inputCls = 'w-full border border-[rgba(0,0,0,0.14)] rounded-[10px] px-4 py-3 text-[14px] text-[#1A1A1A] bg-white outline-none transition-all placeholder:text-[#AAAAAA] focus:ring-2 focus:ring-[#1A1A1A]/10';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await signUp(email, password);
    if (success) navigate('/verify-email', { state: { email } });
  };

  return (
    <AuthLayout backPath="/onboarding" title="Get started" subtitle="Create your free account">

      {/* Tab switcher */}
      <div className="flex w-full rounded-[10px] p-1 mb-7" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <button className="flex-1 py-2 rounded-[8px] text-[13px] font-medium text-white bg-dark shadow-sm">
          Sign up
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-2 rounded-[8px] text-[13px] font-medium text-muted hover:text-dark transition-colors"
        >
          Log in
        </button>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-secondary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-secondary">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-muted">Minimum 6 characters</p>
        </div>

        {error && (
          <div className="px-3.5 py-3 bg-peach text-orange text-[13px] rounded-[10px] border border-peachborder">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dark text-white py-3.5 rounded-[12px] text-[14px] font-medium mt-1 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-surface border border-border text-dark py-3.5 rounded-[12px] text-[14px] font-medium flex justify-center items-center gap-2.5 hover:bg-appbg active:scale-[0.98] transition-all disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-[12px] text-muted text-center mt-1">
          By signing up you agree to our{' '}
          <button type="button" onClick={() => navigate('/terms')} className="text-dark hover:underline">
            Terms & Privacy
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
