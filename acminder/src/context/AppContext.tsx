import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ScheduleItem, Conflict, User } from '../types';
import { supabase } from '../lib/supabase';
import { getItems, addItem as addItemApi, updateItem as updateItemApi, deleteItem as deleteItemApi, ensureProfileExists } from '../lib/supabase';
import { calculateConflicts } from '../lib/conflictEngine';
import { saveProviderToken } from '../hooks/useGoogleCalendar';

function getResolvedKey(userId: string) {
  return `acminder_resolved_conflicts_${userId}`;
}

function loadResolvedIds(userId: string): Set<string> {
  try {
    const stored = localStorage.getItem(getResolvedKey(userId));
    if (stored) return new Set(JSON.parse(stored));
  } catch (e) { /* ignore */ }
  return new Set();
}

function saveResolvedIds(userId: string, ids: Set<string>) {
  localStorage.setItem(getResolvedKey(userId), JSON.stringify([...ids]));
}

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
  isNewUser: boolean;
  clearNewUser: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [importedSources, setImportedSources] = useState<Set<string>>(new Set());
  const [isNewUser, setIsNewUser] = useState(false);
  const clearNewUser = () => setIsNewUser(false);

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

  // Removed redundant detectConflicts() calls from addItem/updateItem/deleteItem.
  // The useEffect([items]) below handles recalculation whenever items change.
  const addItem = async (item: Omit<ScheduleItem, 'id' | 'created_at'>) => {
    const newItem = await addItemApi(item);
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      // Optimistic update for immediate UI feedback
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } as ScheduleItem : item)));
      await updateItemApi(id, updates);
      await fetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
      // Revert optimistic update on failure
      await fetchItems();
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemApi(id);
      await fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const detectConflicts = () => {
    if (!user?.id) return;
    
    // 1. Calculate the current state of the world
    const calculated = calculateConflicts(items);
    
    // 2. Load what the user has previously resolved
    const resolvedIdsSet = loadResolvedIds(user.id);
    
    // 3. Garbage Collection: Remove resolved IDs that are no longer possible 
    // (i.e., one of the items was deleted or the conflict no longer exists)
    const activeConflictIds = new Set(calculated.map(c => c.id));
    let hasChanged = false;
    for (const id of resolvedIdsSet) {
      if (!activeConflictIds.has(id)) {
        resolvedIdsSet.delete(id);
        hasChanged = true;
      }
    }
    if (hasChanged) saveResolvedIds(user.id, resolvedIdsSet);

    // 4. Update the state with current resolution status
    const newConflicts = calculated.map((c) => ({
      ...c,
      resolved: resolvedIdsSet.has(c.id),
    }));
    setConflicts(newConflicts);
  };

  const updateConflict = (id: string, updates: Partial<Conflict>) => {
    setConflicts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const resolveConflict = (id: string) => {
    // Persist to localStorage so resolved state survives page refresh
    if (!user?.id) return;
    const resolvedIds = loadResolvedIds(user.id);
    resolvedIds.add(id);
    saveResolvedIds(user.id, resolvedIds);
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

  // Recalculate conflicts whenever items change (with persisted resolved state applied)
  useEffect(() => {
    detectConflicts();
  }, [items]);

  useEffect(() => {
    const checkProfile = (sessionUser: any) => {
      if (!sessionUser?.id) return;
      // Fire-and-forget: don't block the auth state change callback
      ensureProfileExists(sessionUser.id, sessionUser.email || '')
        .then((isNew) => { if (isNew) setIsNewUser(true); })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : 'Authentication error. Please try again.';
          setToast({ message: msg, visible: true });
        });
    };

    // Resolve the initial session first, then mark sessionChecked=true.
    // This prevents ProtectedRoute from seeing user=null before Supabase
    // has had a chance to restore the session from the OAuth redirect.
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email || '', name: '' } : null);
      checkProfile(u);
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const u = session?.user;
      // Persist provider_token immediately — it's only available right after OAuth
      if (session?.provider_token) saveProviderToken(session.provider_token);
      setUser(u ? { id: u.id, email: u.email || '', name: '' } : null);
      checkProfile(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionChecked) return; // Don't act until the initial session check finishes
    if (user) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user, sessionChecked]);

  // Expose combined loading: stay true until both the session AND any item fetch finish.
  const isLoading = !sessionChecked || loading;

  return (
    <AppContext.Provider
      value={{
        user, items, conflicts, loading: isLoading,
        fetchItems, addItem, updateItem, deleteItem, detectConflicts, updateConflict, resolveConflict,
        conflictCount: conflicts.filter((c) => !c.resolved).length,
        toast, showToast, hideToast,
        importedSources, setImportedSources,
        logout,
        isNewUser, clearNewUser,
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
