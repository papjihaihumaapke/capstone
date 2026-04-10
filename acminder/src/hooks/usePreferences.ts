import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

function getPrefsKey(userId: string) {
  return `acminder_prefs_${userId}`;
}

export function usePreferences() {
  const { user } = useAppContext();
  const [prefs, setPrefs] = useState({ notifications: true, smartSuggestions: true });

  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(getPrefsKey(user.id));
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse prefs', e);
      }
    }
  }, [user?.id]);

  // Use functional updater to avoid stale closure when both toggles change rapidly
  const setNotifications = (val: boolean) => {
    if (!user?.id) return;
    setPrefs((prev) => {
      const next = { ...prev, notifications: val };
      localStorage.setItem(getPrefsKey(user.id), JSON.stringify(next));
      return next;
    });
  };

  const setSmartSuggestions = (val: boolean) => {
    if (!user?.id) return;
    setPrefs((prev) => {
      const next = { ...prev, smartSuggestions: val };
      localStorage.setItem(getPrefsKey(user.id), JSON.stringify(next));
      return next;
    });
  };

  return { prefs, setNotifications, setSmartSuggestions };
}
