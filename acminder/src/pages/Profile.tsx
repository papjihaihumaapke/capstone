import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';

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
  const items = ctx?.items || [];
  const conflicts = ctx?.conflicts || [];

  const raw = email.split('@')[0] || 'User';
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[._]/g, ' ');
  const initial = raw.charAt(0).toUpperCase();

  const totalItems = items.length;
  const completed = items.filter(i => i.completed).length;
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
          <div className="w-20 h-20 rounded-t-[24px] rounded-br-[24px] rounded-bl-[8px] bg-dark flex flex-col items-center justify-center mb-4 transition-transform active:scale-95">
            <span className="text-[32px] font-bold text-white font-display mb-1">{initial}</span>
          </div>
          <div className="text-h2 font-display text-dark mb-0.5">{displayName}</div>
          <div className="text-caption text-muted">{email}</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-surface rounded-card p-4 border border-border flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-dark leading-none bg-surface">{totalItems}</span>
            <span className="text-label text-muted uppercase mt-1.5">Items</span>
          </div>
          <div className="bg-surface rounded-card p-4 border border-border flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-dark leading-none bg-surface">{completed}</span>
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
            <Row label="Name" value={displayName} />
            <Row label="Email" value={email} last />
          </div>

          <SectionLabel label="Quick Links" />
          <div className="bg-surface rounded-card border border-border overflow-hidden mb-2">
            <Row label="Settings" onClick={() => nav('/settings')} />
            <Row label="Terms & Privacy" onClick={() => nav('/terms')} />
            <Row label="Import Calendar" onClick={() => nav('/import')} last />
          </div>

          <SectionLabel label="App" />
          <div className="bg-surface rounded-card border border-border overflow-hidden">
            <Row label="Version" value="1.0.0" />
            <Row label="Build" value="2026.04" last />
          </div>
        </div>
      </div>
    </div>
  );
}
