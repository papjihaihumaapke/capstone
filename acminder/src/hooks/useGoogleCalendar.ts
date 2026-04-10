import { useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import { fetchGoogleEvents, mapGoogleEventToItem } from '../lib/googleSync';
import { addItems } from '../lib/supabase';

export function useGoogleCalendar() {
  const [syncing, setSyncing] = useState(false);
  const ctx = useContext(AppContext);
  const { user, showToast, fetchItems, detectConflicts } = ctx || {};

  const sync = async () => {
    if (!user || !showToast) return;
    
    try {
      setSyncing(true);
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session?.provider_token;

      if (!providerToken) {
        showToast('Google session expired. Please reconnect in Settings.');
        return;
      }

      const events = await fetchGoogleEvents(providerToken);
      const itemsToAdd = events.map(e => mapGoogleEventToItem(e, user.id));
      
      if (itemsToAdd.length > 0) {
        await addItems(itemsToAdd as any);
        await fetchItems?.();
        detectConflicts?.();
        showToast(`Successfully synced ${itemsToAdd.length} events from Google!`);
      } else {
        showToast('No new events found in Google Calendar.');
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      showToast('Calendar sync failed. Try reconnecting your account.');
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing };
}
