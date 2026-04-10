import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault(): void }) => {
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
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backPath="/login" title="Reset password" subtitle="We'll send a link to your email">
      {sent ? (
        <div className="flex flex-col gap-5 items-center text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center">
            <MailCheck size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-textPrimary text-lg mb-1">Check your inbox</h3>
            <p className="text-sm text-textSecondary">A password reset link has been sent to <span className="font-semibold text-textPrimary">{email}</span>.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-display font-semibold active:scale-[0.98] transition shadow-blue hover:bg-primaryDark"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-textPrimary bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-textSecondary/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-display font-semibold disabled:opacity-60 active:scale-[0.98] transition shadow-blue hover:bg-primaryDark mt-2"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-danger text-xs font-medium rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
