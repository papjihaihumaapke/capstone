import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';

const inputCls = 'w-full border border-[rgba(0,0,0,0.14)] rounded-[10px] px-4 py-3 text-[14px] text-[#1A1A1A] bg-white outline-none transition-all placeholder:text-[#AAAAAA] focus:ring-2 focus:ring-[#1A1A1A]/10';

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
    <AuthLayout backPath="/login" title="Reset password" subtitle="We'll send you a link">
      {sent ? (
        <div className="flex flex-col gap-5 items-center text-center py-4">
          <div className="w-14 h-14 rounded-[16px] bg-dark/5 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              <path d="m16 19 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-dark mb-2">Check your inbox</h3>
            <p className="text-[13px] text-secondary leading-relaxed">
              A reset link was sent to{' '}
              <strong className="text-dark font-medium">{email}</strong>.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-dark text-white py-3.5 rounded-[12px] text-[14px] font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-secondary">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
            />
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
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
