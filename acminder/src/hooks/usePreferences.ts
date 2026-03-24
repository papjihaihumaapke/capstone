import { useState, useEffect } from 'react';

export function usePreferences() {
  const [prefs, setPrefs] = useState({ notifications: true, smartSuggestions: true });

  useEffect(() => {
    const stored = localStorage.getItem('acminder_prefs');
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse prefs', e);
      }
    }
  }, []);

  // Use functional updater to avoid stale closure when both toggles change rapidly
  const setNotifications = (val: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, notifications: val };
      localStorage.setItem('acminder_prefs', JSON.stringify(next));
      return next;
    });
  };

  const setSmartSuggestions = (val: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, smartSuggestions: val };
      localStorage.setItem('acminder_prefs', JSON.stringify(next));
      return next;
    });
  };

  return { prefs, setNotifications, setSmartSuggestions };
}
