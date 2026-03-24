import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backPath="/login">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-textPrimary leading-tight">
          Reset <span className="text-primary">password</span>
        </h1>
        <p className="text-base text-textSecondary font-body mt-2">
          We'll send a reset link to your email.
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm font-medium">
            Check your inbox — a password reset link is on its way.
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold active:scale-[0.98] transition"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold disabled:opacity-70 active:scale-[0.98] transition"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
