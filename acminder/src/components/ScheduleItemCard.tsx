import { Pencil, CheckCircle2 } from 'lucide-react';
import type { ScheduleItem } from '../types';

function formatTime12(timeStr: string | undefined) {
  if (!timeStr) return '';
  // Strip seconds if present (HH:MM:SS → HH:MM)
  const t = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
  // If it's already in 12-hour format, just return it.
  if (/[AaPp][Mm]$/.test(t)) return t;

  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return t;
  const h24 = Number(match[1]);
  const mins = match[2];
  if (Number.isNaN(h24)) return t;

  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins} ${ampm}`;
}

interface Props {
  item: ScheduleItem;
  conflictSeverity?: 'none' | 'critical' | 'minor';
  onClick?: () => void;
  onMarkDone?: () => void;
}

const TYPE_STYLES = {
  shift: 'bg-primary',
  class: 'bg-blue-500',
  assignment: 'bg-yellow-500',
};

export default function ScheduleItemCard({ item, conflictSeverity = 'none', onClick, onMarkDone }: Props) {
  return (
    <div
      onClick={onClick}
      className="relative w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 mb-3 active:scale-95 transition-transform cursor-pointer hover:scale-[1.01] duration-150"
    >
      {/* Type Indicator */}
      <div className={`w-3 h-3 rounded-full shrink-0 ${TYPE_STYLES[item.type]}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base text-textPrimary truncate leading-tight mb-1">
          {item.title}
        </h3>
        {item.type !== 'assignment' ? (
          <p className="font-body text-sm text-textSecondary truncate">
            {formatTime12(item.start_time)} - {formatTime12(item.end_time)}
          </p>
        ) : (
          <p className="font-body text-sm text-textSecondary truncate">
            Due: {(item as any).due_date} {formatTime12((item as any).due_time)}
          </p>
        )}
        {(item as any).location && (
          <p className="font-body text-xs text-gray-400 truncate mt-1">{(item as any).location}</p>
        )}
      </div>

      {/* Action / Badges */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {conflictSeverity === 'critical' && (
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
            Conflict
          </span>
        )}
        {conflictSeverity === 'minor' && (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
            Tight Schedule
          </span>
        )}
        <div className="flex items-center gap-1">
          {onMarkDone && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkDone(); }}
              className="p-2 text-gray-300 hover:text-green-500 transition-colors"
              title="Mark as done"
            >
              <CheckCircle2 size={20} />
            </button>
          )}
          <button className="p-2 -mr-2 text-gray-300 hover:text-primary transition-colors">
            <Pencil size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
