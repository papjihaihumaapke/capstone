import { useState } from 'react';
import type { ScheduleItem, RoutineItem } from '../types';

function getDoneKey(userId: string) { return `acminder_done_items_${userId}`; }
function getDoneIds(userId: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(getDoneKey(userId)) || '[]')); } catch { return new Set(); }
}
function saveDoneId(userId: string, id: string) {
  try { const s = getDoneIds(userId); s.add(id); localStorage.setItem(getDoneKey(userId), JSON.stringify([...s])); } catch {}
}

function formatTimeOnly(timeStr: string | undefined) {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  const h24 = Number(match[1]);
  if (Number.isNaN(h24)) return timeStr;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h12}:${match[2]} ${ampm}`;
}

function getItemSubtitle(item: ScheduleItem) {
  if (item.type === 'shift')      return [item.role, item.location].filter(Boolean).join(' · ');
  if (item.type === 'class')      return [item.course, item.location].filter(Boolean).join(' · ');
  if (item.type === 'assignment') return item.course || '';
  if (item.type === 'routine')    return (item as RoutineItem).category || 'Habit';
  return (item as any).location || '';
}

const TYPE_LABELS: Record<string, string> = {
  class: 'College', shift: 'Work', assignment: 'Task', routine: 'Habit'
};

interface Props {
  item: ScheduleItem;
  userId: string;
  conflictSeverity?: 'none' | 'critical' | 'minor';
  onClick?: () => void;
  onMarkDone?: () => void;
}

export default function ScheduleItemCard({ item, userId, conflictSeverity = 'none', onClick, onMarkDone }: Props) {
  const [markedDone, setMarkedDone] = useState(() => !!item.completed || getDoneIds(userId).has(item.id));

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (markedDone) return;
    setMarkedDone(true);
    saveDoneId(userId, item.id);
    onMarkDone?.();
  };

  const subtitle     = getItemSubtitle(item);
  const timeDisplay  = item.type !== 'assignment' ? formatTimeOnly(item.start_time) : formatTimeOnly((item as any).due_time);
  const isConflict   = conflictSeverity !== 'none' && !markedDone;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-[12px] flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all hover:shadow-tile-hover ${
        markedDone ? 'opacity-50' : ''
      } ${isConflict ? 'border-l-2 border-orange' : ''}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)' }}
    >
      {/* Time */}
      <div className="w-[52px] shrink-0">
        <span className={`text-[11px] font-medium leading-none ${markedDone ? 'text-muted line-through' : isConflict ? 'text-orange' : 'text-muted'}`}>
          {timeDisplay || '—'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium leading-snug truncate ${markedDone ? 'line-through text-muted' : 'text-dark'}`}>
          {item.title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {isConflict ? (
          <span className="px-2 py-0.5 rounded-badge text-[10px] font-semibold bg-orange/10 text-orange">
            Overlap
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-badge text-[10px] font-medium bg-appbg text-muted">
            {TYPE_LABELS[item.type] || item.type}
          </span>
        )}

        {!markedDone && onMarkDone && (
          <button
            onClick={handleMarkDone}
            className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:border-dark hover:bg-dark group transition-all"
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              className="text-transparent group-hover:text-white transition-colors">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        )}

        {markedDone && (
          <div className="w-5 h-5 rounded-full bg-dark flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
