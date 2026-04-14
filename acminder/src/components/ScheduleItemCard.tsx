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
  if (item.type === 'shift') return [item.role, item.location].filter(Boolean).join(' • ');
  if (item.type === 'class') return [item.course, item.location].filter(Boolean).join(' • ');
  if (item.type === 'assignment') return item.course || '';
  if (item.type === 'routine') return (item as RoutineItem).category || 'Habit';
  return (item as any).location || '';
}

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

  const subtitle = getItemSubtitle(item);
  const timeDisplay = item.type !== 'assignment' ? formatTimeOnly(item.start_time) : formatTimeOnly((item as any).due_time);

  const getDotColor = () => {
    if (conflictSeverity !== 'none') return 'bg-orange';
    if (markedDone) return 'bg-muted';
    return 'bg-dark';
  };

  const isConflict = conflictSeverity !== 'none' && !markedDone;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-card p-3.5 flex items-center gap-3 border border-border cursor-pointer active:scale-[0.98] transition-all hover:bg-appbg/50 ${markedDone ? 'opacity-60' : ''}`}
    >
      {/* Left Column (Time) */}
      <div className="flex items-center gap-1.5 w-16 shrink-0">
        <div className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
        <span className={`text-[11px] font-bold leading-none ${markedDone ? 'text-muted line-through' : 'text-dark'}`}>
          {timeDisplay}
        </span>
      </div>

      {/* Middle Column (Content) */}
      <div className="flex-1 min-w-0">
        <div className={`text-bodybold truncate ${markedDone ? 'text-muted line-through' : 'text-dark'}`}>
          {item.title}
        </div>
        {subtitle && (
          <div className="text-caption text-muted mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right Column (Badges / Actions) */}
      <div className="flex gap-1.5 shrink-0 items-center">
        {isConflict && (
          <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-peach text-orange">
            Overlap
          </span>
        )}
        
        {!isConflict && item.type === 'class' && (
          <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-dark/5 text-dark">
            College
          </span>
        )}
        
        {!isConflict && item.type === 'shift' && (
          <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-dark/5 text-dark">
            Work
          </span>
        )}

        {!isConflict && item.type === 'assignment' && (
          <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider border border-dark text-dark">
            Task
          </span>
        )}

        {!markedDone && onMarkDone && !isConflict && (
          <button
            onClick={handleMarkDone}
            className="w-5 h-5 rounded-full border border-border flex items-center justify-center hover:bg-dark hover:border-dark group ml-1"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-white transition-colors" />
          </button>
        )}

        {markedDone && (
          <div className="w-5 h-5 rounded-full bg-dark flex items-center justify-center ml-1">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
          </div>
        )}
      </div>
    </div>
  );
}
