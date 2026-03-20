import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { Mail, History, ChevronRight, Bell, Sparkles, Palette, Database, FileText, LogOut, CalendarDays } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { user, logout, showToast } = ctx || {};
  const { signOut } = useAuth();
  const { prefs, setNotifications, setSmartSuggestions } = usePreferences();

  const handleSignOut = async () => {
    await signOut();
    logout && logout();
    navigate('/login');
  };

  const openTerms = () => {
    window.open('https://example.com/terms', '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-4 animate-fadeIn">
      <h1 className="text-2xl font-display font-bold mb-6">Settings</h1>

      {/* ACCOUNT */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Account</div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400" />
              <span className="font-medium">Email</span>
            </div>
            <span className="text-gray-500">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <History size={20} className="text-gray-400" />
              <span className="font-medium">History</span>
            </div>
            <button
              type="button"
              onClick={() => showToast?.('History is coming soon.')}
              className="text-gray-400"
              aria-label="History"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* SCHEDULE */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Schedule</div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/import')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <CalendarDays size={20} className="text-gray-400" />
              <span className="font-medium">Import calendar</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Preferences</div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-400" />
              <span className="font-medium">Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!prefs.notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${prefs.notifications ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${prefs.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-gray-400" />
              <span className="font-medium">Smart Suggestions</span>
            </div>
            <button
              onClick={() => setSmartSuggestions(!prefs.smartSuggestions)}
              className={`w-12 h-6 rounded-full transition-colors ${prefs.smartSuggestions ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${prefs.smartSuggestions ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-gray-400" />
              <span className="font-medium">Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Light</span>
              <button
                type="button"
                onClick={() => showToast?.('Theme switching is coming soon.')}
                className="text-gray-400"
                aria-label="Theme"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Privacy</div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-gray-400" />
              <span className="font-medium">Data Usage</span>
            </div>
            <button
              type="button"
              onClick={() => showToast?.('Data usage details are coming soon.')}
              className="text-gray-400"
              aria-label="Data Usage"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-400" />
              <span className="font-medium">Terms</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" onClick={openTerms} />
          </div>
        </div>
      </div>

      {/* LOG OUT */}
      <button
        onClick={handleSignOut}
        className="w-full bg-transparent text-red-600 py-3 rounded-md font-semibold border border-red-200 hover:bg-red-50"
      >
        <LogOut size={20} className="inline mr-2" />
        Log Out
      </button>
    </div>
  );
}
