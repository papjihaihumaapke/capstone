import { useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import { fetchGoogleEvents, mapGoogleEventToItem } from '../lib/googleSync';
import { addItems } from '../lib/supabase';

const PROVIDER_TOKEN_KEY = 'acminder_google_provider_token';
const LAST_SYNC_KEY = 'acminder_google_last_sync';
const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export function saveProviderToken(token: string) {
  try { localStorage.setItem(PROVIDER_TOKEN_KEY, token); } catch {}
}

export function loadProviderToken(): string | null {
  try { return localStorage.getItem(PROVIDER_TOKEN_KEY); } catch { return null; }
}

export function clearProviderToken() {
  try { localStorage.removeItem(PROVIDER_TOKEN_KEY); } catch {}
}

function getLastSyncTime(): number {
  try { return parseInt(localStorage.getItem(LAST_SYNC_KEY) || '0', 10); } catch { return 0; }
}

function setLastSyncTime() {
  try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch {}
}

export function useGoogleCalendar() {
  const [syncing, setSyncing] = useState(false);
  const ctx = useContext(AppContext);
  const { user, showToast, fetchItems, detectConflicts } = ctx || {};

  /**
   * @param silent - if true, suppresses "no new events" toasts (used for auto-sync on page load)
   */
  const sync = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!user || !showToast) return;

    // Cooldown: skip auto-syncs that are within 1 hour of the last sync
    if (silent) {
      const elapsed = Date.now() - getLastSyncTime();
      if (elapsed < SYNC_COOLDOWN_MS) return;
    }

    try {
      setSyncing(true);

      const { data: { session } } = await supabase.auth.getSession();
      const freshToken = session?.provider_token;
      if (freshToken) saveProviderToken(freshToken);

      const providerToken = freshToken || loadProviderToken();

      if (!providerToken) {
        // Only notify the user if they manually triggered the sync
        if (!silent) showToast('Connect your Google account in Settings to sync your calendar.');
        return;
      }

      const events = await fetchGoogleEvents(providerToken);
      const itemsToAdd = events.map(e => mapGoogleEventToItem(e, user.id));

      if (itemsToAdd.length > 0) {
        const added = await addItems(itemsToAdd as any);
        await fetchItems?.();
        detectConflicts?.();
        setLastSyncTime();
        // Only toast if explicitly triggered by the user, not on background auto-sync
        if (!silent) showToast(`Synced ${added.length} events from Google Calendar!`);
      } else {
        setLastSyncTime();
        // Silently succeed when there are no events — don't nag the user
        if (!silent) showToast('Google Calendar is up to date.');
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      const msg: string = error?.message || '';
      if (msg.includes('403') || msg.includes('401') || msg.includes('Forbidden') || msg.includes('Unauthorized')) {
        clearProviderToken();
        if (!silent) showToast('Google Calendar access expired. Please reconnect in Settings.');
      } else {
        if (!silent) showToast('Calendar sync failed. Please try again.');
      }
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing };
}
