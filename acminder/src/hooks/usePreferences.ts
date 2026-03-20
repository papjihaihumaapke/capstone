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

  const updatePrefs = (newPrefs: typeof prefs) => {
    setPrefs(newPrefs);
    localStorage.setItem('acminder_prefs', JSON.stringify(newPrefs));
  };

  const setNotifications = (val: boolean) => updatePrefs({ ...prefs, notifications: val });
  const setSmartSuggestions = (val: boolean) => updatePrefs({ ...prefs, smartSuggestions: val });

  return { prefs, setNotifications, setSmartSuggestions };
}