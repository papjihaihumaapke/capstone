import { createClient } from '@supabase/supabase-js';
import type { ScheduleItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key must be set in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typed helper functions
export const getItems = async (userId: string): Promise<ScheduleItem[]> => {
  const { data, error } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const ensureProfileExists = async (userId: string, email: string): Promise<boolean> => {
  // Check if a profile already exists for this user ID
  const { error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  // PGRST116 = zero rows — this is a new user ID
  if (error && error.code === 'PGRST116') {
    // Before creating a new profile, check whether this email is already
    // registered under a DIFFERENT user ID (e.g. email/password account).
    // This happens when Google OAuth creates a new UUID for an existing email.
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing && existing.id !== userId) {
      // Sign out the duplicate OAuth session and surface a clear error
      await supabase.auth.signOut();
      throw new Error(
        'An account with this email already exists. Please sign in with your email and password instead.'
      );
    }

    // Safe to create the profile
    await supabase.from('profiles').insert({ id: userId, email });
    return true; // New user
  }

  return false; // Profile already existed for this user ID
};

export const addItem = async (item: Omit<ScheduleItem, 'id' | 'created_at'>): Promise<ScheduleItem> => {
  const { data, error } = await supabase
    .from('schedule_items')
    .insert(item)
    .select()
    .single();
  if (error) {
    const code = (error as any)?.code as string | undefined;
    if (code === '23505') throw new Error('This item already exists.');
    if (code === '23503') throw new Error('Invalid user/session. Please log in again.');
    throw error;
  }
  return data;
};

export const addItems = async (items: Array<Omit<ScheduleItem, 'id' | 'created_at'>>): Promise<ScheduleItem[]> => {
  if (items.length === 0) return [];
  const { data, error } = await supabase
    .from('schedule_items')
    .insert(items)
    .select('*');
    
  if (error) throw error;
  return data || [];
};

export const updateItem = async (id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> => {
  const { data, error } = await supabase
    .from('schedule_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('schedule_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
