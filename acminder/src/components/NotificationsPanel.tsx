import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, X, Bell, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Conflict } from '../types';

function formatTime12(t: string) {
  const match = t.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const h = Number(match[1]);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${ampm}`;
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute top-14 right-4 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-elevated border border-border z-50 animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={16} className="primary" />
            <h3 className="font-display font-bold text-sm text-primary">Notifications</h3>
            {unresolved.length > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unresolved.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[360px] overflow-y-auto">
          {unresolved.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="text-success" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-primary mb-1">All caught up!</p>
              <p className="text-xs text-secondary text-center">No schedule conflicts to worry about.</p>
            </div>
          ) : (
            <div className="py-1">
              {unresolved.map((c) => {
                const isCritical = c.severity !== 'minor';
                const dateStr = c.date || '';
                const overlap = overlapLabel(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/conflict/${c.id}`);
                      onClose();
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface/60 transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCritical ? 'bg-red-50' : 'bg-warning/10'}`}>
                      <AlertTriangle size={14} className={isCritical ? 'text-danger' : 'text-warning'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary leading-snug">
                        {c.item_a.title}
                        <span className="text-secondary font-normal mx-1">vs</span>
                        {c.item_b.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {dateStr && (
                          <span className="text-[10px] text-secondary">
                            {format(new Date(`${dateStr}T00:00:00`), 'MMM d')}
                          </span>
                        )}
                        {overlap && (
                          <span className="text-[10px] primary flex items-center gap-0.5">
                            <Clock size={8} /> {overlap}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isCritical ? 'bg-red-50 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {isCritical ? 'Conflict' : 'Tight'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {unresolved.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-surface/30">
            <button
              onClick={() => {
                navigate('/home?tab=suggestions');
                onClose();
              }}
              className="w-full text-center text-xs font-semibold primary hover:primaryDark transition-colors"
            >
              View all conflicts →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
