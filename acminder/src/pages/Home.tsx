import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import DateStrip from '../components/DateStrip';
import FeaturedConflictCard from '../components/FeaturedConflictCard';
import NotificationsPanel from '../components/NotificationsPanel';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { itemOccursOnDate } from '../lib/conflictEngine';
import { CalendarDays, Bell, Plus } from 'lucide-react';
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

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none ${
        active ? 'bg-primary text-white shadow-blue' : 'bg-white text-textSecondary border border-border hover:border-primary/30'
      }`}
    >
      {label}
    </button>
  );
}

function QuickStat({ value, label, description, accent }: { value: number; label: string; description: string; accent: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-3 shadow-card border border-border text-center flex flex-col items-center justify-center min-h-[90px] hover:shadow-elevated transition-shadow duration-200">
      <div className={`text-xl font-bold font-display ${accent}`}>{value}</div>
      <div className="text-[10px] text-textPrimary font-bold mt-1 leading-tight uppercase tracking-wide">{label}</div>
      <div className="text-[11px] text-textSecondary mt-1 leading-tight max-w-[80px]">{description}</div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const ctx = useContext(AppContext);
  const { items, conflicts } = ctx || {};
  const [filter, setFilter] = useState<FC>('all');
  const [selDate, setSelDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const { sync } = useGoogleCalendar();

  // Auto-sync on load
  useEffect(() => {
    sync();
  }, []);

  const selStr = format(selDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todaysItems = useMemo(() => (items || [])
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
  
  const dayConflict = useMemo(() => allUnresolved.find(c => getConflictDateStr(c) === selStr), [allUnresolved, selStr]);

  const endStr = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  const fc = useMemo(() => allUnresolved
    .map(c => ({ c, dateStr: getConflictDateStr(c) }))
    .filter(x => x.dateStr >= todayStr && x.dateStr <= endStr)
    .sort((x, y) => x.dateStr.localeCompare(y.dateStr)),
    [allUnresolved, todayStr, endStr]
  );

  const email = ctx?.user?.email || '';
  const name = email.split('@')[0] || 'there';
  const initial = email.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="relative min-h-screen bg-background animate-fadeIn overflow-x-hidden">
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 lg:px-8 pb-28">

        {/* ───── Header ───── */}
        <div className="pt-6 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-gradient flex items-center justify-center shadow-blue">
              <span className="text-white font-bold text-sm">{initial}</span>
            </div>
            <div>
            <div className="flex flex-col">
              <h2 className="font-display text-base font-bold text-textPrimary leading-tight">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, <span className="capitalize">{name}</span>
              </h2>
            </div>
            </div>
          </div>
          <div className="flex gap-2 items-center relative">
            <button
              type="button"
              onClick={() => nav('/calendar')}
              className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shadow-card hover:border-primary/30 transition-colors"
              aria-label="Calendar"
            >
              <CalendarDays size={17} className="text-textSecondary" />
            </button>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center relative shadow-card hover:border-primary/30 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} className="text-textSecondary" />
              {clashN > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px]">
                  {clashN > 9 ? '9+' : clashN}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationsPanel
                conflicts={conflicts || []}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>

        <div className="mt-3 mb-1">
          <h3 className="text-2xl font-display font-bold text-textPrimary">
            {format(selDate, 'MMMM')} <span className="text-textSecondary font-normal">{format(selDate, 'yyyy')}</span>
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            {selStr === todayStr ? "Today's" : format(selDate, 'MMM d')} schedule
          </p>
        </div>

        <DateStrip selectedDate={selDate} onDateSelect={setSelDate} />

        {/* ───── Stats ───── */}
        <div className="flex gap-2 mb-6">
          <QuickStat 
            value={todaysItems.length} 
            label="Tasks" 
            description="Items today"
            accent="text-primary" 
          />
          <QuickStat 
            value={clashN} 
            label="Conflicts" 
            description="Total issues"
            accent={clashN > 0 ? 'text-danger' : 'text-success'} 
          />
          <QuickStat 
            value={completed.length} 
            label="Done" 
            description="Finished"
            accent="text-success" 
          />
        </div>

        {/* ───── Smart Insights ───── */}
        {(clashN > 0 || dayConflict) && (
          <section className="mb-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-textSecondary">Smart Insights</h3>
              </div>
              {clashN > 1 && (
                <span className="text-[10px] font-bold bg-danger/10 text-danger px-2 py-0.5 rounded-full uppercase">
                  {clashN} Potential Issues
                </span>
              )}
            </div>

            {dayConflict ? (
              <FeaturedConflictCard 
                conflict={dayConflict} 
                totalCount={clashN} 
                onClick={() => nav(`/conflict/${dayConflict.id}`)} 
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                {fc.map(({ c, dateStr }) => (
                  <div 
                    key={c.id}
                    onClick={() => nav(`/conflict/${c.id}`)}
                    className="min-w-[280px] bg-white rounded-3xl p-5 border border-border shadow-sm active:scale-95 transition-all cursor-pointer hover:border-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{format(new Date(`${dateStr}T00:00:00`), 'MMM d')}</span>
                      <span className="text-[10px] text-textSecondary">•</span>
                      <span className="text-[10px] font-bold text-danger uppercase tracking-wider">{c.severity} overlap</span>
                    </div>
                    <h4 className="text-sm font-bold text-textPrimary truncate">{c.item_a.title} vs {c.item_b.title}</h4>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Mobile Timeline Summary (New) */}
        <div className="lg:hidden mb-6">
          <div className="bg-blue-subtle/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays size={16} className="text-primary" />
              </div>
              <div className="text-xs font-bold text-textPrimary uppercase tracking-wide">Daily Timeline</div>
            </div>
            <button 
              onClick={() => nav('/calendar')}
              className="text-[10px] font-bold text-primary uppercase border-b border-primary/30"
            >
              View Full →
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
              {FILTERS.map(f => (
                <FilterChip key={f.key} active={filter === f.key} label={f.label} onClick={() => setFilter(f.key)} />
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-textPrimary">
                On Progress ({onProgress.length})
              </span>
            </div>

            {onProgress.length === 0 && completed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                  <CalendarDays size={28} className="text-border" strokeWidth={1.5} />
                </div>
                <div className="text-sm font-semibold text-textSecondary">Nothing scheduled</div>
                <p className="text-xs text-textSecondary mt-1">
                  {selStr === todayStr ? "Add items to your schedule" : format(selDate, "MMM d, yyyy")}
                </p>
                <button
                  onClick={() => nav('/add')}
                  className="mt-3 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primaryDark transition-colors shadow-blue flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
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
                </div>

                {completed.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-textPrimary">Completed</span>
                      <span className="text-xs text-textSecondary">{completed.length} items</span>
                    </div>
                    <div className="space-y-3">
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
              </>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-card sticky top-6">
              <h3 className="font-display font-bold text-base text-textPrimary mb-4">Timeline</h3>
              <div className="space-y-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = 8 + i;
                  const label = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                  const itemsAtHour = todaysItems.filter(item => {
                    const itemTime = item.type === 'assignment' ? (item.due_time || item.start_time) : item.start_time;
                    const startH = parseInt(itemTime?.split(':')[0] || '99', 10);
                    return startH === hour;
                  });
                  return (
                    <div key={hour} className="flex items-start gap-3 py-1.5">
                      <span className="text-[11px] text-textSecondary font-medium w-16 shrink-0 pt-0.5">{label}</span>
                      <div className="flex-1 min-h-[28px] border-l-2 border-border/50 pl-3">
                        {itemsAtHour.map(it => {
                          const colors: Record<string, string> = {
                            shift: 'bg-primary/10 text-primary border-primary/20',
                            class: 'bg-accent/10 text-accent border-accent/20',
                            assignment: 'bg-warning/10 text-warning border-warning/20',
                            routine: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          };
                          return (
                            <button
                              key={it.id}
                              onClick={() => nav(`/item/${it.id}`)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border truncate max-w-full block mb-1 text-left hover:opacity-80 transition-opacity ${colors[it.type] || ''}`}
                            >
                              {it.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <button
        onClick={() => nav('/add')}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-blue hover:bg-primaryDark active:scale-95 transition-all z-20"
        aria-label="Add new item"
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
