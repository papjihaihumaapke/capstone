import { useState } from 'react';
import { Briefcase, BookOpen, FileText, CheckCircle2, ChevronRight, AlertTriangle, Moon, Dumbbell, Utensils, Sparkles } from 'lucide-react';
import type { ScheduleItem, RoutineItem } from '../types';

function getDoneKey(userId: string) { return `acminder_done_items_${userId}`; }
function getDoneIds(userId: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(getDoneKey(userId)) || '[]')); } catch { return new Set(); }
}
function saveDoneId(userId: string, id: string) {
  try { const s = getDoneIds(userId); s.add(id); localStorage.setItem(getDoneKey(userId), JSON.stringify([...s])); } catch {}
}

function formatTime12(timeStr: string | undefined) {
  if (!timeStr) return '';
  const t = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
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

function formatDueDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  // Monthly initials for better readability
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getItemSubtitle(item: ScheduleItem) {
  if (item.type === 'shift') return [item.role, item.location].filter(Boolean).join(' • ');
  if (item.type === 'class') return [item.course, item.location].filter(Boolean).join(' • ');
  if (item.type === 'assignment') return item.course || '';
  if (item.type === 'routine') return (item as RoutineItem).category || 'Habit';
  return (item as any).location || '';
}

const TYPE_CONFIG: Record<string, any> = {
  shift: { border: 'border-l-primary', iconBg: 'bg-primaryLight', iconColor: 'text-primary', tagBg: 'bg-primaryLight', tagColor: 'text-primary', Icon: Briefcase, label: 'Work' },
  class: { border: 'border-l-accent', iconBg: 'bg-accentLight', iconColor: 'text-accent', tagBg: 'bg-accentLight', tagColor: 'text-accent', Icon: BookOpen, label: 'College' },
  assignment: { border: 'border-l-warning', iconBg: 'bg-warning/10', iconColor: 'text-warning', tagBg: 'bg-warning/10', tagColor: 'text-warning', Icon: FileText, label: 'Tasks' },
  routine: { border: 'border-l-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', tagBg: 'bg-indigo-50', tagColor: 'text-indigo-600', Icon: Sparkles, label: 'Habits' },
};

const ROUTINE_ICONS: Record<string, any> = {
  sleep: Moon,
  gym: Dumbbell,
  meal: Utensils,
  study: BookOpen,
  other: Sparkles,
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
  const cfg = TYPE_CONFIG[item.type];
  
  // Use category-specific icon for routines, otherwise use the default icon from config
  const Icon = item.type === 'routine' 
    ? (ROUTINE_ICONS[(item as RoutineItem).category || 'other'] || cfg.Icon)
    : cfg.Icon;

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (markedDone) return;
    setMarkedDone(true);
    saveDoneId(userId, item.id);
    onMarkDone?.();
  };

  const subtitle = getItemSubtitle(item);
  const isRoutine = item.type === 'routine';
  const timeDisplay = item.type !== 'assignment'
    ? `${formatTime12(item.start_time)} – ${formatTime12(item.end_time)}`
    : `Due: ${formatDueDate((item as unknown as { due_date?: string }).due_date)} ${formatTime12((item as unknown as { due_time?: string }).due_time)}`;

  const dueDays = item.type === 'assignment' ? (() => {
    const d = (item as unknown as { due_date?: string }).due_date || item.date;
    if (!d) return null;
    const due = new Date(`${d}T00:00:00`);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  })() : null;

  return (
    <div
      onClick={onClick}
      className={`relative w-full bg-white rounded-2xl border border-border border-l-[3px] ${cfg.border} shadow-card p-3 mb-2.5 flex items-center gap-3.5 active:scale-[0.98] transition-all cursor-pointer hover:shadow-elevated duration-150 ${markedDone ? 'opacity-50' : ''} ${isRoutine ? 'bg-indigo-50/10' : ''}`}
    >
      {/* Type icon */}
      <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={cfg.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={`font-semibold text-sm text-textPrimary truncate leading-tight ${markedDone ? 'line-through text-textSecondary' : ''}`}>
            {item.title}
          </h3>
          {markedDone && (
            <CheckCircle2 size={14} className="text-success shrink-0" />
          )}
          {isRoutine && !markedDone && (
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md uppercase tracking-wider shrink-0">Habit</span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-textSecondary truncate">{subtitle}</p>
        )}
        <p className="text-[11px] text-textSecondary mt-0.5">{timeDisplay}</p>
      </div>

      {/* Right: badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {conflictSeverity === 'critical' && !markedDone && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-danger text-[10px] font-bold rounded-full">
            <AlertTriangle size={9} /> Overlap
          </span>
        )}
        {conflictSeverity === 'minor' && !markedDone && (
          <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-full">Tight</span>
        )}
        {dueDays !== null && dueDays <= 0 && !markedDone && (
          <span className="px-2 py-0.5 bg-red-50 text-danger text-[10px] font-bold rounded-full">
            {dueDays === 0 ? 'Today' : 'Overdue'}
          </span>
        )}
        {dueDays !== null && dueDays === 1 && !markedDone && (
          <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-full">Soon</span>
        )}
        {onMarkDone && !markedDone && (
          <button
            onClick={handleMarkDone}
            className="p-1 text-border hover:text-success transition-colors relative z-20"
            title="Mark as done"
          >
            <CheckCircle2 size={20} />
          </button>
        )}
        <ChevronRight size={15} className="text-border" />
      </div>
    </div>
  );
}
