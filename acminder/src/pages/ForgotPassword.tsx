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
    <AuthLayout backPath="/login" title="Reset password" subtitle="Link sent to your email">
      {sent ? (
        <div className="flex flex-col gap-6 items-center text-center py-6">
          <div className="w-16 h-16 rounded-badge bg-appbg border border-border flex items-center justify-center">
            <MailCheck size={32} className="text-dark" />
          </div>
          <div>
            <h3 className="text-h3 font-display text-dark mb-2">Check your inbox</h3>
            <p className="text-caption text-secondary">A reset link has been sent to <span className="font-bold text-dark">{email}</span>.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-dark text-white py-4 rounded-btn font-display font-bold active:scale-[0.98] transition shadow-none uppercase tracking-widest"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label font-bold text-muted uppercase tracking-wider">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-border rounded-btn px-4 py-3.5 text-body text-dark bg-surface outline-none transition-all placeholder:text-muted/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-white py-4 rounded-btn font-display font-bold disabled:opacity-30 active:scale-[0.98] transition shadow-none mt-2 uppercase tracking-widest"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {error && (
            <div className="p-4 bg-peach text-orange text-caption font-bold rounded-btn text-center border border-peachborder">
              {error}
            </div>
          )}
        </form>
      )}
    </AuthLayout>
  );
}
