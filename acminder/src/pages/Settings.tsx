import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { supabase } from '../lib/supabase';
import { Mail, ChevronRight, Bell, Sparkles, FileText, CalendarDays, Upload, LogOut } from 'lucide-react';

function SectionLabel({ label }: { label: string }) {
  return <div className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">{label}</div>;
}

function SettingRow({
  icon: Icon, label, right, onClick, borderBottom = true,
}: {
  icon: React.ElementType; label: string; right?: React.ReactNode;
  onClick?: () => void; borderBottom?: boolean;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 min-h-[3.5rem] transition-colors text-left ${onClick ? 'cursor-pointer hover:bg-appbg/50 active:bg-border/40' : ''} ${borderBottom ? 'border-b border-border' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-muted shrink-0" />
        <span className="font-medium text-[14px] text-dark">{label}</span>
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
      className={`w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-dark' : 'bg-border'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

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
      logout?.();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-24 lg:pb-10">
      <div className="max-w-[960px] mx-auto px-5 lg:px-8 pt-8 lg:pt-10 pb-8">

        <h1 className="text-[20px] font-semibold text-dark mb-8">Settings</h1>

        {/* Desktop 2-col grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">

          {/* ── LEFT column ─────────────────────── */}
          <div className="space-y-6">

            {/* Account */}
            <div>
              <SectionLabel label="Account" />
              <div className="bg-surface rounded-card border border-border overflow-hidden">
                <SettingRow
                  icon={Mail}
                  label="Email"
                  right={<span className="text-[12px] text-muted truncate max-w-[180px]">{user?.email}</span>}
                  borderBottom={false}
                />
              </div>
            </div>

            {/* Schedule */}
            <div>
              <SectionLabel label="Schedule" />
              <div className="bg-surface rounded-card border border-border overflow-hidden">
                <SettingRow
                  icon={Upload}
                  label="Import Calendar (.ics)"
                  right={<ChevronRight size={16} className="text-muted" />}
                  onClick={() => navigate('/import')}
                />
                <SettingRow
                  icon={CalendarDays}
                  label={syncing ? 'Syncing…' : 'Sync Google Calendar'}
                  onClick={() => sync()}
                  borderBottom={false}
                  right={
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={googleConnected
                          ? { background: '#E6F4ED', color: '#1A7A4A' }
                          : { background: '#EBEBEB', color: '#4A4A4A' }}
                      >
                        {googleConnected ? 'Connected' : 'Not connected'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); signInWithGoogle(); }}
                        className="text-[12px] font-medium text-secondary underline hover:text-dark transition-colors"
                      >
                        {googleConnected ? 'Reconnect' : 'Connect'}
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT column ────────────────────── */}
          <div className="space-y-6">

            {/* Preferences */}
            <div>
              <SectionLabel label="Preferences" />
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
            </div>

            {/* Privacy */}
            <div>
              <SectionLabel label="Privacy" />
              <div className="bg-surface rounded-card border border-border overflow-hidden">
                <SettingRow
                  icon={FileText}
                  label="Terms & Privacy"
                  right={<ChevronRight size={16} className="text-muted" />}
                  onClick={() => navigate('/terms')}
                  borderBottom={false}
                />
              </div>
            </div>

            {/* Log out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-card border border-border bg-surface text-[14px] font-medium text-orange hover:bg-peach transition-colors"
            >
              <LogOut size={15} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
