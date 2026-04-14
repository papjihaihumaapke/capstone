import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import NotificationsPanel from '../components/NotificationsPanel';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { itemOccursOnDate } from '../lib/conflictEngine';
import { getConflictDateStr, overlapLabel } from '../lib/homeHelpers';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { AlertTriangle, ChevronRight, Plus } from 'lucide-react';

type FC = 'all' | 'class' | 'shift' | 'assignment' | 'routine';
const FILTERS: { key: FC; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'class',      label: 'College' },
  { key: 'shift',      label: 'Work' },
  { key: 'assignment', label: 'Tasks' },
  { key: 'routine',    label: 'Habits' },
];

function buildDayStrip() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 2));
}

export default function Home() {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  const { items, conflicts } = ctx || {};
  const [filter, setFilter] = useState<FC>('all');
  const [selDate, setSelDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const { sync } = useGoogleCalendar();

  useEffect(() => { sync({ silent: true }); }, []);

  const selStr  = format(selDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todaysItems = useMemo(() =>
    (items || [])
      .filter(i => itemOccursOnDate(i, selStr))
      .filter(i => filter === 'all' || i.type === filter)
      .sort((a, b) =>
        (a.type === 'assignment' ? (a.due_time || a.start_time || '') : a.start_time)
          .localeCompare(b.type === 'assignment' ? (b.due_time || b.start_time || '') : b.start_time)
      ), [items, selStr, filter]);

  const onProgress = todaysItems.filter(i => !i.completed);
  const completed  = todaysItems.filter(i =>  i.completed);

  const allUnresolved = useMemo(() => (conflicts || []).filter(c => !c.resolved), [conflicts]);
  const clashN = allUnresolved.length;

  const endStr = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  const fc = useMemo(() =>
    allUnresolved
      .map(c => ({ c, dateStr: getConflictDateStr(c) }))
      .filter(x => x.dateStr >= todayStr && x.dateStr <= endStr)
      .sort((x, y) => x.dateStr.localeCompare(y.dateStr)),
    [allUnresolved, todayStr, endStr]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const email = ctx?.user?.email || '';
  const firstName = (() => {
    const raw = email.split('@')[0] || 'there';
    return raw.charAt(0).toUpperCase() + raw.slice(1).split(/[._]/)[0];
  })();

  const days = useMemo(() => buildDayStrip(), []);
  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    (items || []).forEach(item => {
      days.forEach(d => {
        const ds = format(d, 'yyyy-MM-dd');
        if (itemOccursOnDate(item, ds)) set.add(ds);
      });
    });
    return set;
  }, [items, days]);

  // ── Date strip ──────────────────────────────────────────────
  const DateStrip = () => (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
      {days.map(day => {
        const ds = format(day, 'yyyy-MM-dd');
        const isActive = isSameDay(day, selDate);
        const hasEvents = daysWithEvents.has(ds);
        return (
          <button
            key={ds}
            type="button"
            onClick={() => setSelDate(day)}
            className={`flex flex-col items-center gap-1 min-w-[44px] py-2.5 px-1 rounded-[14px] cursor-pointer transition-colors ${
              isActive ? 'bg-dark' : 'hover:bg-appbg'
            }`}
          >
            <span className={`text-[10px] font-medium uppercase tracking-wide ${isActive ? 'text-white/60' : 'text-muted'}`}>
              {format(day, 'EEE')}
            </span>
            <span className={`text-[16px] font-semibold leading-none ${isActive ? 'text-white' : 'text-dark'}`}>
              {format(day, 'd')}
            </span>
            <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white/40' : hasEvents ? 'bg-orange' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </div>
  );

  // ── Timeline section ─────────────────────────────────────────
  const Timeline = () => (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-badge text-[12px] font-medium cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === f.key
                ? 'bg-dark text-white'
                : 'bg-appbg text-secondary hover:text-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {onProgress.length === 0 && completed.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-12 h-12 bg-appbg rounded-[14px] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p className="text-[14px] font-medium text-dark">Nothing scheduled</p>
          <p className="text-[12px] text-muted text-center">Add items to start building your day</p>
          <button
            onClick={() => nav('/add')}
            className="mt-1 bg-dark text-white rounded-btn px-5 py-2 text-[13px] font-medium hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Add item
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {onProgress.map(it => (
            <ScheduleItemCard
              key={it.id}
              item={it}
              userId={ctx?.user?.id || ''}
              conflictSeverity={(conflicts || []).find(c => (c.item_a.id === it.id || c.item_b.id === it.id) && !c.resolved)?.severity || 'none'}
              onClick={() => nav(`/item/${it.id}`)}
              onMarkDone={() => ctx?.updateItem?.(it.id, { completed: true })}
            />
          ))}

          {completed.length > 0 && (
            <div className="pt-4">
              <p className="text-[11px] font-medium text-muted uppercase tracking-widest mb-2">Completed</p>
              <div className="space-y-2 opacity-60">
                {completed.map(it => (
                  <ScheduleItemCard
                    key={it.id}
                    item={it}
                    userId={ctx?.user?.id || ''}
                    conflictSeverity="none"
                    onClick={() => nav(`/item/${it.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Conflicts panel (used on desktop sidebar + mobile card) ──
  const ConflictsPanel = ({ compact = false }: { compact?: boolean }) => {
    if (clashN === 0) {
      return (
        <div className="flex flex-col items-center py-8 gap-2">
          <div className="w-10 h-10 bg-appbg rounded-[12px] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-[13px] font-medium text-dark">All clear</p>
          <p className="text-[12px] text-muted text-center">No schedule conflicts</p>
        </div>
      );
    }

    const shown = compact ? fc.slice(0, 3) : fc;

    return (
      <div className="space-y-2">
        {shown.map(({ c, dateStr }) => {
          const overlap = overlapLabel(c);
          return (
            <button
              key={c.id}
              onClick={() => nav(`/conflict/${c.id}`)}
              className="w-full text-left bg-appbg hover:bg-peach rounded-[12px] p-3 transition-colors group"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 bg-orange/10 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange/20 transition-colors">
                  <AlertTriangle size={12} className="text-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-dark leading-snug truncate">
                    {c.item_a.title} <span className="text-muted font-normal">vs</span> {c.item_b.title}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {format(new Date(`${dateStr}T00:00:00`), 'MMM d')}
                    {overlap && ` · ${overlap}`}
                  </p>
                </div>
                <ChevronRight size={12} className="text-muted shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
        {compact && fc.length > 3 && (
          <button
            onClick={() => nav('/home')}
            className="w-full text-center text-[12px] text-muted font-medium py-2 hover:text-dark transition-colors"
          >
            +{fc.length - 3} more conflicts
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-appbg pb-24 lg:pb-10">
      <div className="px-4 lg:px-8 pt-6 lg:pt-8 max-w-content">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6 lg:mb-8">
          <div>
            <p className="text-[13px] text-muted mb-0.5">{greeting},</p>
            <h1 className="text-[24px] font-semibold text-dark leading-tight">{firstName}</h1>
          </div>
          <div className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => nav('/calendar')}
              className="w-9 h-9 bg-surface rounded-[10px] flex items-center justify-center hover:bg-appbg transition-colors"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowNotifications(p => !p)}
              className="w-9 h-9 bg-surface rounded-[10px] flex items-center justify-center hover:bg-appbg transition-colors relative"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {clashN > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-orange text-white text-[9px] font-semibold rounded-badge flex items-center justify-center px-1">
                  {clashN > 9 ? '9+' : clashN}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationsPanel conflicts={conflicts || []} onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>

        {/* ── Desktop: 2-column bento grid ────────────────── */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-4">

          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div className="space-y-3">

            {/* Date tile */}
            <div className="bento-tile">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[20px] font-semibold text-dark">{format(selDate, 'MMMM')}</span>
                <span className="text-[20px] font-normal text-muted">{format(selDate, 'yyyy')}</span>
              </div>
              <DateStrip />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bento-tile-sm">
                <div className="text-[28px] font-bold text-dark leading-none">{todaysItems.length}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider mt-2">Tasks</div>
                <div className="text-[10px] text-muted/60 mt-0.5">Today</div>
              </div>
              <div className="rounded-bento p-4" style={{
                background: clashN > 0 ? '#E55B45' : '#1A1A1A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
              }}>
                <div className="text-[28px] font-bold text-white leading-none">{clashN}</div>
                <div className="text-[11px] font-medium text-white/60 uppercase tracking-wider mt-2">Conflicts</div>
                <div className="text-[10px] text-white/40 mt-0.5">{clashN === 0 ? 'Clear' : 'Issues'}</div>
              </div>
              <div className="bento-tile-sm">
                <div className="text-[28px] font-bold text-dark leading-none">{completed.length}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider mt-2">Done</div>
                <div className="text-[10px] text-muted/60 mt-0.5">Finished</div>
              </div>
            </div>

            {/* Mobile-only: conflict card */}
            {clashN > 0 && (
              <div className="lg:hidden bento-tile !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-3"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange/10 rounded-[8px] flex items-center justify-center">
                      <AlertTriangle size={13} className="text-orange" />
                    </div>
                    <span className="text-[13px] font-semibold text-dark">
                      {clashN} Conflict{clashN > 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => nav(`/conflict/${allUnresolved[0]?.id}`)}
                    className="text-[12px] text-muted font-medium hover:text-dark transition-colors flex items-center gap-1"
                  >
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-3">
                  <ConflictsPanel compact />
                </div>
              </div>
            )}

            {/* Timeline tile */}
            <div className="bento-tile">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-dark">
                  {isSameDay(selDate, new Date()) ? "Today's Schedule" : format(selDate, 'EEE, MMM d')}
                </h2>
                <button onClick={() => nav('/calendar')} className="text-[12px] text-muted font-medium hover:text-dark transition-colors">
                  Full calendar →
                </button>
              </div>
              <Timeline />
            </div>
          </div>

          {/* ── RIGHT COLUMN (desktop only) ──────────────── */}
          <div className="hidden lg:flex flex-col gap-3">

            {/* Conflicts panel tile */}
            <div className="bento-tile">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold text-dark">Conflicts</h2>
                  {clashN > 0 && (
                    <span className="min-w-[20px] h-5 bg-orange text-white text-[10px] font-semibold rounded-badge flex items-center justify-center px-1.5">
                      {clashN}
                    </span>
                  )}
                </div>
                {clashN > 0 && (
                  <button
                    onClick={() => nav(`/conflict/${allUnresolved[0]?.id}`)}
                    className="text-[12px] text-muted hover:text-dark transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
              <ConflictsPanel />
            </div>

            {/* Quick add tile */}
            <div className="bento-tile">
              <h2 className="text-[14px] font-semibold text-dark mb-3">Quick Add</h2>
              <div className="space-y-2">
                {(['class', 'shift', 'assignment', 'routine'] as const).map(type => {
                  const labels: Record<string, string> = {
                    class: 'Class', shift: 'Work Shift',
                    assignment: 'Task', routine: 'Habit'
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => nav('/add')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-appbg hover:bg-border/30 rounded-[10px] transition-colors text-left"
                    >
                      <div className="w-5 h-5 bg-dark/8 rounded-[6px] flex items-center justify-center">
                        <Plus size={11} className="text-dark" />
                      </div>
                      <span className="text-[13px] text-dark">{labels[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
