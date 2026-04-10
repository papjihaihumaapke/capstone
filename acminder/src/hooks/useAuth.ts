import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, pass: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (authError) throw authError;
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (authError) throw authError;
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        },
      });
      if (authError) throw authError;
      return true;
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Failed to sign in with Google.';
      if (msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled')) {
        msg = 'Google login is currently disabled for this project. Please use your email/password.';
      }
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Get current user ID before signing out so we can clear their scoped keys
      const { data: { session } } = await supabase.auth.getSession();
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      const uid = session?.user?.id;
      if (uid) {
        localStorage.removeItem(`acminder_done_items_${uid}`);
        localStorage.removeItem(`acminder_resolved_conflicts_${uid}`);
        localStorage.removeItem(`acminder_prefs_${uid}`);
      }
      // Also clear legacy un-scoped keys
      localStorage.removeItem('acminder_done_items');
      localStorage.removeItem('acminder_resolved_conflicts');
      localStorage.removeItem('acminder_prefs');
      return true;
    } catch (err: unknown) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, signUp, signIn, signInWithGoogle, signOut };
}
