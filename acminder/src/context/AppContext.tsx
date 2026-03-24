import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ScheduleItem, Conflict, User } from '../types';
import { supabase } from '../lib/supabase';
import { getItems, addItem as addItemApi, updateItem as updateItemApi, deleteItem as deleteItemApi } from '../lib/supabase';
import { calculateConflicts } from '../lib/conflictEngine';

interface AppContextType {
  user: User | null;
  items: ScheduleItem[];
  conflicts: Conflict[];
  loading: boolean;
  fetchItems: () => Promise<ScheduleItem[] | undefined>;
  addItem: (item: Omit<ScheduleItem, 'id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  detectConflicts: () => void;
  updateConflict: (id: string, updates: Partial<Conflict>) => void;
  resolveConflict: (conflictId: string) => void;
  conflictCount: number;
  toast: { message: string; visible: boolean } | null;
  showToast: (message: string) => void;
  hideToast: () => void;
  importedSources: Set<string>;
  setImportedSources: React.Dispatch<React.SetStateAction<Set<string>>>;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [importedSources, setImportedSources] = useState<Set<string>>(new Set());

  const fetchItems = async () => {
    if (!user?.id) return undefined;
    try {
      setLoading(true);
      const data = await getItems(user.id);
      setItems(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<ScheduleItem, 'id' | 'created_at'>) => {
    const newItem = await addItemApi(item);
    setItems((prev) => [...prev, newItem]);
    detectConflicts();
  };

  const updateItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      await updateItemApi(id, updates);
      await fetchItems();
      detectConflicts();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemApi(id);
      await fetchItems();
      detectConflicts();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const detectConflicts = () => {
    const newConflicts = calculateConflicts(items);
    setConflicts(newConflicts);
  };

  const updateConflict = (id: string, updates: Partial<Conflict>) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const resolveConflict = (id: string) => {
    updateConflict(id, { resolved: true });
  };

  const showToast = (message: string) => setToast({ message, visible: true });
  const hideToast = () => setToast(null);
  const logout = () => {
    setUser(null);
    setItems([]);
    setConflicts([]);
    setLoading(false);
  };

  useEffect(() => {
    detectConflicts();
  }, [items]);

  useEffect(() => {
    const ensureProfile = async (sessionUser: any) => {
      if (!sessionUser?.id) return;
      await supabase.from('profiles').upsert({ id: sessionUser.id, email: sessionUser.email || '', name: '' });
    };

    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      await ensureProfile(session?.user);
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '', name: '' } : null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      ensureProfile(session?.user);
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '', name: '' } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{ 
        user, items, conflicts, loading, 
        fetchItems, addItem, updateItem, deleteItem, detectConflicts, updateConflict, resolveConflict,
        conflictCount: conflicts.filter(c => !c.resolved).length,
        toast, showToast, hideToast,
        importedSources, setImportedSources,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
