import { useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AppContext } from '../context/AppContext';
import { fetchGoogleEvents, mapGoogleEventToItem } from '../lib/googleSync';
import { addItems } from '../lib/supabase';

const PROVIDER_TOKEN_KEY = 'acminder_google_provider_token';

/** Persist the provider_token right after OAuth so it survives page reloads. */
export function saveProviderToken(token: string) {
  try { localStorage.setItem(PROVIDER_TOKEN_KEY, token); } catch {}
}

/** Retrieve a stored provider_token (falls back to session token). */
export function loadProviderToken(): string | null {
  try { return localStorage.getItem(PROVIDER_TOKEN_KEY); } catch { return null; }
}

export function clearProviderToken() {
  try { localStorage.removeItem(PROVIDER_TOKEN_KEY); } catch {}
}

export function useGoogleCalendar() {
  const [syncing, setSyncing] = useState(false);
  const ctx = useContext(AppContext);
  const { user, showToast, fetchItems, detectConflicts } = ctx || {};

  const sync = async () => {
    if (!user || !showToast) return;

    try {
      setSyncing(true);

      // 1. Try to get a fresh token from the current session first
      const { data: { session } } = await supabase.auth.getSession();
      const freshToken = session?.provider_token;

      // If we just got a fresh one from OAuth, persist it
      if (freshToken) saveProviderToken(freshToken);

      // 2. Fall back to the cached token
      const providerToken = freshToken || loadProviderToken();

      if (!providerToken) {
        showToast('Connect your Google account in Settings to sync your calendar.');
        return;
      }

      const events = await fetchGoogleEvents(providerToken);
      const itemsToAdd = events.map(e => mapGoogleEventToItem(e, user.id));

      if (itemsToAdd.length > 0) {
        await addItems(itemsToAdd as any);
        await fetchItems?.();
        detectConflicts?.();
        showToast(`Synced ${itemsToAdd.length} events from Google Calendar!`);
      } else {
        showToast('No new events found in Google Calendar.');
      }
    } catch (error: any) {
      console.error('Sync failed:', error);

      // If the token is stale (401/403), clear cache so we don't keep retrying with it
      const msg: string = error?.message || '';
      if (msg.includes('403') || msg.includes('401') || msg.includes('Forbidden') || msg.includes('Unauthorized')) {
        clearProviderToken();
        showToast('Google Calendar access expired. Please reconnect in Settings.');
      } else {
        showToast('Calendar sync failed. Please try again.');
      }
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing };
}
