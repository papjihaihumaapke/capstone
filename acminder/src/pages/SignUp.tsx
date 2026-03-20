import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const success = await signUp(email, password);
    if (success) {
      navigate('/import');
    }
  };

  return (
    <AuthLayout backPath="/onboarding">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-textPrimary leading-tight">
          Get <span className="text-primary">started</span>
        </h1>
        <p className="text-base text-textSecondary font-body mt-2">Create your account</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex w-full bg-gray-100 rounded-full p-1 mb-8">
        <button 
          className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white bg-primary shadow-sm"
        >
          Sign Up
        </button>
        <button 
          onClick={() => navigate('/login')}
          className="flex-1 py-2.5 rounded-full text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textPrimary">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-textPrimary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textPrimary">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base text-textPrimary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
          />
        </label>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold transition-transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center shadow-sm"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
