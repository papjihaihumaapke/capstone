import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import NotificationsPanel from '../components/NotificationsPanel';
import FeaturedConflictCard from '../components/FeaturedConflictCard';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { itemOccursOnDate } from '../lib/conflictEngine';
import { getConflictDateStr } from '../lib/homeHelpers';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

type FC = 'all' | 'class' | 'shift' | 'assignment' | 'routine';
const FILTERS: { key: FC; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'class', label: 'College' },
  { key: 'shift', label: 'Work' },
  { key: 'assignment', label: 'Tasks' },
  { key: 'routine', label: 'Habits' },
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

  const selStr = format(selDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todaysItems = useMemo(() =>
    (items || [])
      .filter(i => itemOccursOnDate(i, selStr))
      .filter(i => filter === 'all' || i.type === filter)
      .sort((a, b) => (
        (a.type === 'assignment' ? (a.due_time || a.start_time || '') : a.start_time)
          .localeCompare(b.type === 'assignment' ? (b.due_time || b.start_time || '') : b.start_time)
      )), [items, selStr, filter]);

  const onProgress = todaysItems.filter(i => !i.completed);
  const completed = todaysItems.filter(i => i.completed);

  const allUnresolved = useMemo(() => (conflicts || []).filter(c => !c.resolved), [conflicts]);
  const clashN = allUnresolved.length;

  const dayConflict = useMemo(() =>
    allUnresolved.find(c => getConflictDateStr(c) === selStr), [allUnresolved, selStr]);

  const endStr = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  const fc = useMemo(() =>
    allUnresolved
      .map(c => ({ c, dateStr: getConflictDateStr(c) }))
      .filter(x => x.dateStr >= todayStr && x.dateStr <= endStr)
      .sort((x, y) => x.dateStr.localeCompare(y.dateStr)),
    [allUnresolved, todayStr, endStr]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
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

  return (
    <div className="min-h-[100dvh] bg-appbg relative overflow-x-hidden pb-32">
      <div className="max-w-[480px] mx-auto">
        
        {/* STATUS BAR */}
        <div className="flex justify-between items-center px-5 pt-[14px]">
          <span className="text-[15px] font-bold text-dark">9:41</span>
          <div className="flex gap-1.5 items-center opacity-55">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="1" fill="#0D0D0D"/>
              <rect x="4.5" y="5" width="3" height="7" rx="1" fill="#0D0D0D"/>
              <rect x="9" y="2" width="3" height="10" rx="1" fill="#0D0D0D"/>
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#0D0D0D"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#0D0D0D"/>
              <path d="M5.2 7.5A4 4 0 0 1 8 6.5a4 4 0 0 1 2.8 1" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M2.8 5A7 7 0 0 1 8 3a7 7 0 0 1 5.2 2" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M0.5 2.5A10.5 10.5 0 0 1 8 0a10.5 10.5 0 0 1 7.5 2.5" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#0D0D0D" strokeWidth="1"/>
              <rect x="2" y="2" width="13" height="8" rx="1.5" fill="#0D0D0D"/>
              <path d="M19.5 4v4" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-[18px]">
          <div>
            <div className="text-h2 font-display text-secondary font-normal leading-tight">{greeting}</div>
            <div className="text-h2 font-display text-dark leading-tight">{firstName}</div>
          </div>
          <div className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => nav('/calendar')}
              aria-label="Calendar"
              className="w-9 h-9 bg-surface rounded-btn border border-border flex items-center justify-center hover:bg-appbg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowNotifications(p => !p)}
              aria-label="Notifications"
              className="w-9 h-9 bg-surface rounded-btn border border-border flex items-center justify-center hover:bg-appbg relative"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {clashN > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-orange text-white text-[9px] font-bold rounded-badge flex items-center justify-center px-1">
                  {clashN > 9 ? '9+' : clashN}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationsPanel conflicts={conflicts || []} onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>

        {/* DATE SECTION */}
        <div className="px-5 pt-5 pb-0 flex items-center justify-between">
          <span className="text-label text-orange uppercase tracking-widest">OVERVIEW</span>
        </div>

        <div className="px-5 pt-3">
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-h1 font-display text-dark">{format(selDate, 'MMMM')}</span>
            <span className="text-h1 font-display text-muted !font-normal">{format(selDate, 'yyyy')}</span>
          </div>

          {/* DAY STRIP */}
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
                  className={`flex flex-col items-center gap-1 min-w-[44px] py-2.5 px-1 rounded-[14px] cursor-pointer transition-colors ${isActive ? 'bg-dark' : 'bg-transparent'}`}
                >
                  <span className={`text-[10px] font-medium uppercase tracking-wide ${isActive ? 'text-white/50' : 'text-muted'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-[16px] font-bold leading-none ${isActive ? 'text-white' : 'text-dark'}`}>
                    {format(day, 'd')}
                  </span>
                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white/50' : hasEvents ? 'bg-orange' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-2.5 px-5 pt-4">
          <div className="bg-surface rounded-card border border-border p-3">
            <div className="text-[26px] font-bold text-dark leading-none">{todaysItems.length}</div>
            <div className="text-label text-muted uppercase mt-1">TASKS</div>
            <div className="text-[10px] text-muted/60 mt-0.5">Today</div>
          </div>
          <div className="bg-orange rounded-card p-3">
            <div className="text-[26px] font-bold text-white leading-none">{clashN}</div>
            <div className="text-label text-white/70 uppercase mt-1">CONFLICTS</div>
            <div className="text-[10px] text-white/50 mt-0.5">Issues</div>
          </div>
          <div className="bg-surface rounded-card border border-border p-3">
            <div className="text-[26px] font-bold text-dark leading-none">{completed.length}</div>
            <div className="text-label text-muted uppercase mt-1">DONE</div>
            <div className="text-[10px] text-muted/60 mt-0.5">Finished</div>
          </div>
        </div>

        {/* SMART INSIGHTS */}
        {(clashN > 0 || dayConflict) && (
          <div className="px-5 pt-4">
            {dayConflict ? (
              <FeaturedConflictCard
                conflict={dayConflict}
                totalCount={clashN}
                onClick={() => nav(`/conflict/${dayConflict.id}`)}
              />
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {fc.map(({ c, dateStr }) => (
                  <div
                    key={c.id}
                    onClick={() => nav(`/conflict/${c.id}`)}
                    className="min-w-[260px] bg-peach rounded-card border border-peachborder p-3.5 cursor-pointer flex-shrink-0 mb-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-7 h-7 bg-orange rounded-badge flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                       </div>
                       <span className="text-caption font-bold text-orange">{format(new Date(`${dateStr}T00:00:00`), 'MMM d')} • {c.severity} overlap</span>
                    </div>
                    <div className="text-caption text-peachtext leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                      {c.item_a.title} vs {c.item_b.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE SECTION HEADER */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <span className="text-label text-orange uppercase tracking-widest">TIMELINE</span>
          <button onClick={() => nav('/calendar')} className="text-caption text-orange font-semibold">View full →</button>
        </div>

        {/* FILTER PILLS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pl-5 pr-5 pt-3">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-[20px] text-caption font-medium cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${
                filter === f.key 
                ? 'bg-dark text-white border border-dark' 
                : 'bg-surface text-muted border border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* SCHEDULE LIST / EMPTY STATE */}
        <div className="px-5 pt-3">
          {onProgress.length === 0 && completed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2.5">
              <div className="w-14 h-14 bg-border/40 rounded-[18px] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-bodybold text-dark mt-1">Nothing scheduled</div>
              <div className="text-caption text-muted text-center">Add items to start building your day</div>
              <button
                onClick={() => nav('/add')}
                className="mt-2 bg-dark text-white rounded-btn px-5 py-2 text-body font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                + Add item
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
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
                <div className="mt-4">
                  <div className="flex items-center justify-between pt-5 pb-0 mb-3">
                    <span className="text-label text-orange uppercase tracking-widest">COMPLETED</span>
                  </div>
                  <div className="flex flex-col gap-2">
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
      </div>
    </div>
  );
}
