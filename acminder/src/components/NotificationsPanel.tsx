import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Conflict } from '../types';

function formatTime12(t: string) {
  const match = t.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const h = Number(match[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${match[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

function overlapLabel(c: Conflict) {
  if (!c.overlap_start || !c.overlap_end) return '';
  if (c.overlap_start === c.overlap_end) return formatTime12(c.overlap_start);
  return `${formatTime12(c.overlap_start)} – ${formatTime12(c.overlap_end)}`;
}

interface Props {
  conflicts: Conflict[];
  onClose: () => void;
}

export default function NotificationsPanel({ conflicts, onClose }: Props) {
  const navigate = useNavigate();
  const unresolved = conflicts.filter(c => !c.resolved);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-11 right-0 w-[320px] max-w-[calc(100vw-2rem)] bg-surface rounded-bento z-50 animate-slideUp overflow-hidden"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-dark">Conflicts</span>
            {unresolved.length > 0 && (
              <span className="bg-orange text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-badge min-w-[18px] text-center">
                {unresolved.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-[6px] hover:bg-appbg flex items-center justify-center transition-colors">
            <X size={13} className="text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[340px] overflow-y-auto">
          {unresolved.length === 0 ? (
            <div className="flex flex-col items-center py-10 px-4 gap-2">
              <div className="w-10 h-10 rounded-[12px] bg-appbg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-[13px] font-medium text-dark">All caught up</p>
              <p className="text-[12px] text-muted text-center">No schedule conflicts to worry about.</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {unresolved.map((c) => {
                const isCritical = c.severity !== 'minor';
                const dateStr = c.date || '';
                const overlap = overlapLabel(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/conflict/${c.id}`); onClose(); }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-appbg rounded-[10px] transition-colors text-left"
                  >
                    <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical ? 'bg-orange/10' : 'bg-dark/5'
                    }`}>
                      <AlertTriangle size={13} className={isCritical ? 'text-orange' : 'text-muted'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-dark leading-snug">
                        {c.item_a.title}
                        <span className="text-muted font-normal mx-1"> vs </span>
                        {c.item_b.title}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {dateStr && format(new Date(`${dateStr}T00:00:00`), 'MMM d')}
                        {overlap && ` · ${overlap}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
