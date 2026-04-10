import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { supabase } from '../lib/supabase';
import { Mail, ChevronRight, Bell, Sparkles, FileText, LogOut, CalendarDays } from 'lucide-react';

function SettingRow({
  icon: Icon,
  label,
  right,
  onClick,
  borderBottom = true,
}: {
  icon: React.ElementType;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  borderBottom?: boolean;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 min-h-[3.5rem] hover:bg-gray-50 transition-colors text-left ${borderBottom ? 'border-b border-gray-100' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-gray-400" />
        <span className="font-medium text-textPrimary">{label}</span>
      </div>
      {right}
    </Wrapper>
  );
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export default function Settings() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { user, logout } = ctx || {};
  const { signOut, signInWithGoogle } = useAuth();
  const { prefs, setNotifications, setSmartSuggestions } = usePreferences();
  const { sync, syncing } = useGoogleCalendar();

  // CAMA-89: Track actual Google connection state
  const [googleConnected, setGoogleConnected] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setGoogleConnected(!!session?.provider_token);
    });
  }, [syncing]);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut();
      logout && logout();
      navigate('/login');
    }
  };

  const handleGoogleSync = async () => {
    // If we have a user but maybe no provider token yet, we can re-trigger OAuth to get it
    // Or if we already have it, we just sync.
    // For simplicity, we'll try to sync, and if it fails due to no token, we'll suggest reconnecting.
    await sync();
  };

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      <div className="max-w-lg lg:max-w-xl mx-auto px-4 lg:px-0 py-6">
        <h1 className="text-2xl font-display font-bold mb-6 text-textPrimary">Settings</h1>

        {/* ACCOUNT */}
        <section className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Account</div>
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <SettingRow
              icon={Mail}
              label="Email"
              right={<span className="text-sm text-textSecondary truncate max-w-[180px]">{user?.email}</span>}
              borderBottom={false}
            />
          </div>
        </section>

        {/* SCHEDULE */}
        <section className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Schedule</div>
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <SettingRow
              icon={CalendarDays}
              label="Import Calendar (.ics)"
              right={<ChevronRight size={18} className="text-gray-400" />}
              onClick={() => navigate('/import')}
            />
            <SettingRow
              icon={Sparkles}
              label={syncing ? 'Syncing...' : 'Sync Google Calendar'}
              right={
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    googleConnected 
                      ? 'text-success bg-green-50' 
                      : 'text-gray-400 bg-gray-100'
                  }`}>
                    {googleConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); signInWithGoogle(); }}
                    className="text-xs text-textSecondary underline"
                  >
                    {googleConnected ? 'Reconnect' : 'Connect'}
                  </button>
                </div>
              }
              onClick={handleGoogleSync}
              borderBottom={false}
            />
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Preferences</div>
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <SettingRow
              icon={Bell}
              label="Notifications"
              right={<ToggleSwitch enabled={prefs.notifications} onToggle={() => setNotifications(!prefs.notifications)} />}
            />
            <SettingRow
              icon={Sparkles}
              label="Smart Suggestions"
              right={<ToggleSwitch enabled={prefs.smartSuggestions} onToggle={() => setSmartSuggestions(!prefs.smartSuggestions)} />}
              borderBottom={false}
            />
          </div>
        </section>

        {/* PRIVACY */}
        <section className="mb-6">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Privacy</div>
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <SettingRow
              icon={FileText}
              label="Terms & Privacy"
              right={<ChevronRight size={18} className="text-gray-400" />}
              onClick={() => navigate('/terms')}
              borderBottom={false}
            />
          </div>
        </section>

        {/* LOG OUT */}
        <button
          onClick={handleSignOut}
          className="w-full bg-transparent text-red-600 py-3 rounded-xl font-semibold border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
