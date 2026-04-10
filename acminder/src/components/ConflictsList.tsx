import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { overlapLabel, mitigationIdea } from '../lib/homeHelpers';
import type { Conflict } from '../types';

interface Props {
  futureConflicts: { c: Conflict; dateStr: string }[];
}

export default function ConflictsList({ futureConflicts }: Props) {
  const navigate = useNavigate();

  if (futureConflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-success" strokeWidth={1.5} />
        </div>
        <div className="text-base font-display font-semibold text-textPrimary mb-1">All clear!</div>
        <div className="text-sm text-textSecondary text-center">No clashes in the next 2 weeks</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-bold text-textPrimary">Upcoming Conflicts</span>
        <span className="text-xs text-textSecondary bg-red-50 text-danger font-semibold px-2 py-0.5 rounded-full">
          {futureConflicts.length} total
        </span>
      </div>

      {futureConflicts.slice(0, 6).map(({ c, dateStr }) => {
        const isCritical = c.severity !== 'minor';
        const overlap = overlapLabel(c);
        return (
          <div
            key={c.id}
            className="w-full bg-white border border-border rounded-2xl p-4 cursor-pointer hover:shadow-card transition-all active:scale-[0.99]"
            onClick={() => navigate(`/conflict/${c.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCritical ? 'bg-red-50' : 'bg-warning/10'}`}>
                <AlertTriangle size={16} className={isCritical ? 'text-danger' : 'text-warning'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-textSecondary mb-1">
                  {format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}
                  {overlap && (
                    <span className="ml-2 text-primary inline-flex items-center gap-1">
                      <Clock size={9} /> {overlap}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm text-textPrimary leading-snug">
                  {c.item_a.title}
                  <span className="text-textSecondary font-normal mx-1.5">
                    {c.severity === 'minor' ? 'close to' : 'vs'}
                  </span>
                  {c.item_b.title}
                </div>
                <div className="text-[11px] text-textSecondary mt-1">{mitigationIdea(c)}</div>
              </div>
              <ChevronRight size={16} className="text-border shrink-0 mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
