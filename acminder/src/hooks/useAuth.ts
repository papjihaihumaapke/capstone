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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      return true;
    } catch (err: unknown) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, signUp, signIn, signOut };
}
