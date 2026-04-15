import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, ChevronRight, Pencil, Check, X } from 'lucide-react';

function getNameKey(userId: string) { return `acminder_display_name_${userId}`; }

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
        {value && <span className="text-caption text-muted">{value}</span>}
        {onClick && <ChevronRight size={16} className="text-muted" />}
      </div>
    </Wrapper>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-label font-bold text-muted uppercase tracking-widest mt-6 mb-2 ml-1">
      {label}
    </div>
  );
}

export default function Profile() {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  const email = ctx?.user?.email || '';
  const userId = ctx?.user?.id || '';
  const items = ctx?.items || [];
  const conflicts = ctx?.conflicts || [];

  const fallbackName = (() => {
    const raw = email.split('@')[0] || 'User';
    return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[._]/g, ' ');
  })();

  const [displayName, setDisplayName] = useState(fallbackName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(getNameKey(userId));
    if (saved) setDisplayName(saved);
  }, [userId]);

  const startEdit = () => {
    setDraft(displayName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => { setEditing(false); setDraft(''); };

  const saveName = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    if (userId) localStorage.setItem(getNameKey(userId), trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') cancelEdit();
  };

  const initial = displayName.charAt(0).toUpperCase();
  const totalItems = items.length;
  const completed  = items.filter(i => i.completed).length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-32">
      <div className="max-w-[480px] mx-auto pt-10 px-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center cursor-pointer active:scale-95 transition-all text-dark"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-h2 font-display text-dark">Profile</span>
          <div className="w-9" />
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-t-[24px] rounded-br-[24px] rounded-bl-[8px] bg-dark flex items-center justify-center mb-4">
            <span className="text-[32px] font-bold text-white font-display">{initial}</span>
          </div>

          {editing ? (
            <div className="flex items-center gap-2 w-full max-w-[260px]">
              <input
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={40}
                placeholder="Your name"
                className="flex-1 text-center text-[17px] font-semibold text-dark bg-surface rounded-[10px] px-3 py-1.5 outline-none focus:ring-2 focus:ring-dark/10"
                style={{ border: '1px solid rgba(0,0,0,0.14)' }}
              />
              <button
                onClick={saveName}
                className="w-8 h-8 rounded-[8px] bg-dark flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
              >
                <Check size={14} className="text-white" />
              </button>
              <button
                onClick={cancelEdit}
                className="w-8 h-8 rounded-[8px] bg-appbg border border-border flex items-center justify-center hover:bg-border/40 transition-colors shrink-0"
              >
                <X size={14} className="text-dark" />
              </button>
            </div>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-2 group">
              <span className="text-h2 font-display text-dark">{displayName}</span>
              <div
                className="w-6 h-6 rounded-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#F2F2EF' }}
              >
                <Pencil size={11} className="text-muted" />
              </div>
            </button>
          )}

          <div className="text-caption text-muted mt-1">{email}</div>
          {!editing && (
            <button
              onClick={startEdit}
              className="mt-2 text-[12px] text-muted underline hover:text-dark transition-colors"
            >
              Edit name
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-surface rounded-card p-4 border border-border flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-dark leading-none">{totalItems}</span>
            <span className="text-label text-muted uppercase mt-1.5">Items</span>
          </div>
          <div className="bg-surface rounded-card p-4 border border-border flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-dark leading-none">{completed}</span>
            <span className="text-label text-muted uppercase mt-1.5">Done</span>
          </div>
          <div className={`rounded-card p-4 flex flex-col items-center justify-center ${unresolvedConflicts > 0 ? 'bg-orange border border-orange' : 'bg-surface border border-border'}`}>
            <span className={`text-[26px] font-bold leading-none ${unresolvedConflicts > 0 ? 'text-white' : 'text-dark'}`}>{unresolvedConflicts}</span>
            <span className={`text-label uppercase mt-1.5 ${unresolvedConflicts > 0 ? 'text-white/70' : 'text-muted'}`}>Conflicts</span>
          </div>
        </div>

        {/* Account info */}
        <div>
          <SectionLabel label="Account" />
          <div className="bg-surface rounded-card border border-border overflow-hidden mb-2">
            <Row label="Name" value={displayName} onClick={startEdit} />
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
  );
}
