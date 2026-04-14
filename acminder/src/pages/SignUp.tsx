import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

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
      <div className="flex w-full bg-surface rounded-btn p-1 border border-border mb-8">
        <button className="flex-1 py-2.5 rounded-btn text-caption font-bold text-white bg-dark shadow-none uppercase tracking-widest">
          Sign Up
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-2.5 rounded-btn text-caption font-bold text-muted hover:text-dark transition-colors uppercase tracking-widest"
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-label font-bold text-muted uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-border rounded-btn px-4 py-3.5 text-body text-dark bg-surface outline-none transition-all placeholder:text-muted/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label font-bold text-muted uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full border border-border rounded-btn px-4 py-3.5 pr-12 text-body text-dark bg-surface outline-none transition-all placeholder:text-muted/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Minimum 6 characters</p>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-white py-4 rounded-btn font-display font-bold transition-all active:scale-[0.98] disabled:opacity-60 shadow-none uppercase tracking-widest"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>

          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full bg-white border border-border text-dark py-4 rounded-btn font-display font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center gap-3 hover:bg-appbg uppercase tracking-widest"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </button>

          {error && (
            <div className={`p-4 text-caption font-bold rounded-btn text-center border ${
              error.toLowerCase().includes('google') || error.toLowerCase().includes('too many')
                ? 'bg-peach text-orange border-peachborder' 
                : 'bg-peach text-orange border-peachborder'
            }`}>
              {error}
            </div>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
