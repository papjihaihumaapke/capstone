import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { ensureProfileExists, supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const isNew = await ensureProfileExists(session.user.id, session.user.email || '');
          navigate(isNew ? '/import' : '/home', { replace: true });
        } catch {
          navigate('/login', { replace: true });
        }
      }
    }).catch(() => {});
  }, [navigate]);

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await signIn(email, password);
    if (success) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isNew = await ensureProfileExists(session.user.id, session.user.email || '');
          if (isNew) { navigate('/import'); return; }
        }
      } catch {}
      navigate('/home');
    }
  };

  return (
    <AuthLayout backPath="/splash" title="Welcome back" subtitle="Sign in to your account">
      {/* Tab switcher */}
      <div className="flex w-full bg-surface rounded-2xl p-1 border border-border mb-6">
        <button
          onClick={() => navigate('/signup')}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors"
        >
          Sign Up
        </button>
        <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary shadow-blue">
          Log In
        </button>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-textPrimary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-textPrimary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-textSecondary/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-textPrimary">Password</label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-primary font-semibold hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-border rounded-xl px-4 py-3 pr-12 text-sm text-textPrimary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-textSecondary/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-display font-semibold transition-all active:scale-[0.98] disabled:opacity-60 shadow-blue hover:bg-primaryDark"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-textSecondary font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full bg-white border border-border text-textPrimary py-3.5 rounded-2xl font-display font-semibold transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center gap-3 hover:bg-surface shadow-card"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-danger text-xs font-medium rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
