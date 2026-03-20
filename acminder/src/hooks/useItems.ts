import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getItems, addItem as addItemApi, updateItem as updateItemApi, deleteItem as deleteItemApi } from '../lib/supabase';
import type { ScheduleItem } from '../types';

export function useItems() {
  const ctx = useContext(AppContext);
  const { user, detectConflicts } = ctx || {};
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getItems(user.id);
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<ScheduleItem, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await addItemApi(item);
      setItems(prev => [...prev, newItem]);
      await fetchItems(); // re-fetch
      detectConflicts && detectConflicts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<ScheduleItem>) => {
    try {
      setLoading(true);
      setError(null);
      await updateItemApi(id, updates);
      await fetchItems(); // re-fetch
      detectConflicts && detectConflicts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteItemApi(id);
      await fetchItems(); // re-fetch
      detectConflicts && detectConflicts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user?.id]);

  return { items, addItem, updateItem, deleteItem, loading, error };
}