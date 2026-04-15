import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, ChevronRight, Pencil, Check, X } from 'lucide-react';

function Row({ label, value, onClick, last = false }: { label: string; value?: string; onClick?: () => void; last?: boolean }) {
  const Wrapper: any = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center justify-between py-4 px-4 text-left bg-transparent ${!last ? 'border-b border-border' : ''} ${onClick ? 'cursor-pointer hover:bg-appbg/50 transition-colors' : ''}`}
    >
      <span className="text-body font-medium text-dark">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-caption text-muted truncate max-w-[180px]">{value}</span>}
        {onClick && <ChevronRight size={16} className="text-muted shrink-0" />}
      </div>
    </Wrapper>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div className="text-[11px] font-semibold text-muted uppercase tracking-widest mt-6 mb-2 ml-1">{label}</div>;
}

export default function Profile() {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  const email    = ctx?.user?.email    || '';
  const items    = ctx?.items          || [];
  const conflicts = ctx?.conflicts     || [];
  const updateUserName = ctx?.updateUserName;
  const showToast      = ctx?.showToast;

  const fallbackName = (() => {
    const raw = email.split('@')[0] || 'User';
    return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[._]/g, ' ');
  })();

  // Initialise from context (populated from Supabase user_metadata on load)
  const [displayName, setDisplayName] = useState(ctx?.user?.name || fallbackName);
  const [editing, setSaving_]         = useState(false);
  const [draft, setDraft]             = useState('');
  const [saving, setSaving]           = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep in sync if context user.name arrives after mount (auth re-hydration)
  useEffect(() => {
    if (ctx?.user?.name) setDisplayName(ctx.user.name);
  }, [ctx?.user?.name]);

  const startEdit = () => {
    setDraft(displayName);
    setSaving_(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => { setSaving_(false); setDraft(''); };

  const saveName = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !updateUserName) return;
    setSaving(true);
    try {
      await updateUserName(trimmed);
      setDisplayName(trimmed);
      showToast?.('Name updated');
    } catch {
      showToast?.('Failed to update name');
    } finally {
      setSaving(false);
      setSaving_(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') cancelEdit();
  };

  const initial          = displayName.charAt(0).toUpperCase();
  const totalItems       = items.length;
  const completed        = items.filter(i => i.completed).length;
  const unresolvedCount  = conflicts.filter(c => !c.resolved).length;
  const isEditing        = editing;

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-24 lg:pb-10">
      <div className="max-w-[960px] mx-auto pt-8 lg:pt-10 px-5 lg:px-8">

        {/* Page title row */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="w-9 h-9 rounded-[10px] bg-surface border border-border flex items-center justify-center active:scale-95 transition-all text-dark hover:bg-appbg"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[20px] font-semibold text-dark">Profile</h1>
        </div>

        {/* ── Desktop 2-col ────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">

          {/* LEFT — avatar card */}
          <div className="bento-tile flex flex-col items-center text-center mb-6 lg:mb-0 py-8">
            <div className="w-20 h-20 rounded-t-[24px] rounded-br-[24px] rounded-bl-[8px] bg-dark flex items-center justify-center mb-4">
              <span className="text-[32px] font-bold text-white">{initial}</span>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-[220px]">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={40}
                  placeholder="Your name"
                  disabled={saving}
                  className="flex-1 text-center text-[15px] font-semibold text-dark bg-surface rounded-[10px] px-3 py-1.5 outline-none focus:ring-2 focus:ring-dark/10 disabled:opacity-50"
                  style={{ border: '1px solid rgba(0,0,0,0.14)' }}
                />
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="w-8 h-8 rounded-[8px] bg-dark flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40"
                >
                  <Check size={14} className="text-white" />
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="w-8 h-8 rounded-[8px] bg-appbg border border-border flex items-center justify-center hover:bg-border/40 transition-colors shrink-0"
                >
                  <X size={14} className="text-dark" />
                </button>
              </div>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-2 group justify-center">
                <span className="text-[18px] font-semibold text-dark">{displayName}</span>
                <div className="w-6 h-6 rounded-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ background: '#F2F2EF' }}>
                  <Pencil size={11} className="text-muted" />
                </div>
              </button>
            )}

            <p className="text-[12px] text-muted mt-1.5">{email}</p>

            {!isEditing && (
              <button onClick={startEdit} className="mt-3 text-[12px] font-medium text-muted underline hover:text-dark transition-colors">
                Edit name
              </button>
            )}

            {/* Stats — stacked on left panel on desktop */}
            <div className="w-full mt-6 grid grid-cols-3 gap-2">
              <div className="bg-appbg rounded-[10px] p-3 flex flex-col items-center">
                <span className="text-[20px] font-bold text-dark leading-none">{totalItems}</span>
                <span className="text-[10px] text-muted uppercase tracking-wide mt-1">Items</span>
              </div>
              <div className="bg-appbg rounded-[10px] p-3 flex flex-col items-center">
                <span className="text-[20px] font-bold text-dark leading-none">{completed}</span>
                <span className="text-[10px] text-muted uppercase tracking-wide mt-1">Done</span>
              </div>
              <div className={`rounded-[10px] p-3 flex flex-col items-center ${unresolvedCount > 0 ? 'bg-orange' : 'bg-appbg'}`}>
                <span className={`text-[20px] font-bold leading-none ${unresolvedCount > 0 ? 'text-white' : 'text-dark'}`}>{unresolvedCount}</span>
                <span className={`text-[10px] uppercase tracking-wide mt-1 ${unresolvedCount > 0 ? 'text-white/70' : 'text-muted'}`}>Conflicts</span>
              </div>
            </div>
          </div>

          {/* RIGHT — account + links */}
          <div>
            <SectionLabel label="Account" />
            <div className="bg-surface rounded-card border border-border overflow-hidden mb-2">
              <Row label="Name"  value={displayName} onClick={startEdit} />
              <Row label="Email" value={email} last />
            </div>

            <SectionLabel label="Quick Links" />
            <div className="bg-surface rounded-card border border-border overflow-hidden mb-2">
              <Row label="Analytics"       onClick={() => nav('/analytics')} />
              <Row label="Settings"        onClick={() => nav('/settings')} />
              <Row label="Terms & Privacy" onClick={() => nav('/terms')} />
              <Row label="Import Calendar" onClick={() => nav('/import')} last />
            </div>

            <SectionLabel label="App" />
            <div className="bg-surface rounded-card border border-border overflow-hidden">
              <Row label="Version" value="1.0.0" />
              <Row label="Build"   value="2026.04" last />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
