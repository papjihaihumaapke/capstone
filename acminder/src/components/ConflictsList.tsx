import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { overlapLabel } from '../lib/homeHelpers';
import type { Conflict } from '../types';

interface Props {
  futureConflicts: { c: Conflict; dateStr: string }[];
}

export default function ConflictsList({ futureConflicts }: Props) {
  const navigate = useNavigate();

  if (futureConflicts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 animate-fadeIn">
        <div className="w-12 h-12 rounded-[14px] bg-appbg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-[14px] font-medium text-dark">All clear</p>
        <p className="text-[12px] text-muted text-center">No conflicts in the next 2 weeks</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-semibold text-dark">Upcoming Conflicts</span>
        <span className="text-[11px] font-semibold text-orange bg-orange/10 px-2 py-0.5 rounded-badge">
          {futureConflicts.length} total
        </span>
      </div>

      {futureConflicts.slice(0, 8).map(({ c, dateStr }) => {
        const isCritical = c.severity !== 'minor';
        const overlap = overlapLabel(c);
        return (
          <button
            key={c.id}
            className="w-full bg-surface rounded-[12px] p-3.5 cursor-pointer text-left transition-all hover:shadow-tile-hover active:scale-[0.99]"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)' }}
            onClick={() => navigate(`/conflict/${c.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                isCritical ? 'bg-orange/10' : 'bg-dark/5'
              }`}>
                <AlertTriangle size={14} className={isCritical ? 'text-orange' : 'text-muted'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-muted mb-1">
                  {format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}
                  {overlap && <span className="ml-2 text-muted">· {overlap}</span>}
                </p>
                <p className="text-[13px] font-medium text-dark leading-snug">
                  {c.item_a.title}
                  <span className="text-muted font-normal mx-1.5">vs</span>
                  {c.item_b.title}
                </p>
              </div>
              <ChevronRight size={14} className="text-muted shrink-0 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
