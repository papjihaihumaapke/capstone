import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { supabase } from '../lib/supabase';
import { Mail, ChevronRight, Bell, Sparkles, FileText, CalendarDays } from 'lucide-react';

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
      className={`w-full flex items-center justify-between p-4 min-h-[3.5rem] transition-colors text-left ${onClick ? 'cursor-pointer hover:bg-appbg/50 active:bg-border/40' : ''} ${borderBottom ? 'border-b border-border' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-muted" />
        <span className="font-medium text-body text-dark">{label}</span>
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
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-dark' : 'bg-border'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-none ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
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
    await sync();
  };

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-32">
      <div className="max-w-[480px] mx-auto px-5 pt-12 pb-6">
        <h1 className="text-h1 font-display font-bold mb-8 text-dark">Settings</h1>

        {/* ACCOUNT */}
        <section className="mb-6">
          <div className="text-label text-muted uppercase tracking-widest font-semibold mb-3">Account</div>
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            <SettingRow
              icon={Mail}
              label="Email"
              right={<span className="text-caption text-muted truncate max-w-[180px]">{user?.email}</span>}
              borderBottom={false}
            />
          </div>
        </section>

        {/* SCHEDULE */}
        <section className="mb-6">
          <div className="text-label text-muted uppercase tracking-widest font-semibold mb-3">Schedule</div>
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            <SettingRow
              icon={CalendarDays}
              label="Import Calendar (.ics)"
              right={<ChevronRight size={18} className="text-muted" />}
              onClick={() => navigate('/import')}
            />
            <SettingRow
              icon={Sparkles}
              label={syncing ? 'Syncing...' : 'Sync Google Calendar'}
              onClick={handleGoogleSync}
              borderBottom={false}
              right={
                <div className="flex items-center gap-2">
                  <span
                    className="text-caption font-semibold px-2.5 py-1 rounded-badge"
                    style={googleConnected
                      ? { background: '#E6F4ED', color: '#1A7A4A' }
                      : { background: '#EBEBEB', color: '#4A4A4A' }
                    }
                  >
                    {googleConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); signInWithGoogle(); }}
                    className="text-caption font-medium text-secondary hover:text-dark transition-colors underline"
                  >
                    {googleConnected ? 'Reconnect' : 'Connect'}
                  </button>
                </div>
              }
            />
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="mb-6">
          <div className="text-label text-muted uppercase tracking-widest font-semibold mb-3">Preferences</div>
          <div className="bg-surface rounded-card border border-border overflow-hidden">
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
        <section className="mb-8">
          <div className="text-label text-muted uppercase tracking-widest font-semibold mb-3">Privacy</div>
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            <SettingRow
              icon={FileText}
              label="Terms & Privacy"
              right={<ChevronRight size={18} className="text-muted" />}
              onClick={() => navigate('/terms')}
              borderBottom={false}
            />
          </div>
        </section>

        {/* LOG OUT */}
        <button
          onClick={handleSignOut}
          className="w-full text-center text-orange py-3 font-semibold hover:opacity-80 transition-opacity"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
