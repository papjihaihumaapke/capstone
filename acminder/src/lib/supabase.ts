import { createClient } from '@supabase/supabase-js';
import type { ScheduleItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
  // Check if profile exists
  const { error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
    
  // PGRST116 means zero rows returned
  if (error && error.code === 'PGRST116') {
    // Create the profile
    await supabase.from('profiles').insert({ id: userId, email });
    return true; // Profile was just created (is new user)
  }
  return false; // Profile already existed
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
  const { data, error } = await supabase.from('schedule_items').insert(items).select('*');
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
