import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, BookOpen, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { itemOccursOnDate } from '../lib/conflictEngine';
import { format, subDays } from 'date-fns';

const TYPE_META: Record<string, { label: string; Icon: any; color: string; bg: string }> = {
  shift:      { label: 'Work',    Icon: Briefcase, color: '#1A1A1A', bg: '#F2F2EF' },
  class:      { label: 'College', Icon: BookOpen,  color: '#1A1A1A', bg: '#F2F2EF' },
  assignment: { label: 'Task',    Icon: FileText,  color: '#FFFFFF', bg: '#1A1A1A' },
  routine:    { label: 'Habit',   Icon: Clock,     color: '#1A1A1A', bg: '#F2F2EF' },
};

export default function Analytics() {
  const navigate = useNavigate();
  const { items, conflicts } = useAppContext();

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Build last-7-days date strings oldest → newest
  const last7 = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')),
    [todayStr]
  );

  const stats = useMemo(() => {
    // Today
    const todayItems     = items.filter(i => itemOccursOnDate(i, todayStr));
    const todayDone      = todayItems.filter(i => i.completed);
    const todayRemaining = todayItems.filter(i => !i.completed);

    // Last 7 days — per day breakdown
    const perDay = last7.map(dateStr => {
      const dayItems = items.filter(i => itemOccursOnDate(i, dateStr));
      return {
        dateStr,
        label: format(new Date(dateStr + 'T00:00:00'), 'EEE'),
        total: dayItems.length,
        done: dayItems.filter(i => i.completed).length,
      };
    });

    const weekTotal = perDay.reduce((s, d) => s + d.total, 0);
    const weekDone  = perDay.reduce((s, d) => s + d.done,  0);

    // Items by type (all-time)
    const byType = Object.fromEntries(
      Object.keys(TYPE_META).map(t => [t, items.filter(i => i.type === t).length])
    );

    // Conflict stats
    const resolved   = conflicts.filter(c =>  c.resolved).length;
    const unresolved = conflicts.filter(c => !c.resolved).length;

    // Most conflicted items
    const freq: Record<string, number> = {};
    conflicts.forEach(c => {
      if (c.item_a?.title) freq[c.item_a.title] = (freq[c.item_a.title] || 0) + 1;
      if (c.item_b?.title) freq[c.item_b.title] = (freq[c.item_b.title] || 0) + 1;
    });
    const topConflicted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { todayItems, todayDone, todayRemaining, perDay, weekTotal, weekDone, byType, resolved, unresolved, topConflicted };
  }, [items, conflicts, todayStr]);

  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

  const todayPct = pct(stats.todayDone.length, stats.todayItems.length);
  const weekPct  = pct(stats.weekDone,  stats.weekTotal);

  const barMax = Math.max(...stats.perDay.map(d => d.total), 1);

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-appbg pb-24 lg:pb-10 animate-fadeIn">
        <div className="max-w-[640px] mx-auto px-4 lg:px-8 pt-6 lg:pt-10">
          <div className="flex items-center gap-4 mb-10">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-[8px] bg-surface flex items-center justify-center hover:bg-appbg transition-colors shrink-0"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
              <ArrowLeft size={16} className="text-dark" />
            </button>
            <h1 className="text-[20px] font-semibold text-dark">Analytics</h1>
          </div>
          <div className="bento-tile flex flex-col items-center py-16 gap-3 text-center">
            <p className="text-[15px] font-semibold text-dark">No data yet</p>
            <p className="text-[13px] text-muted leading-relaxed max-w-[240px]">
              Add items to your schedule and mark them done — your stats will appear here.
            </p>
            <button onClick={() => navigate('/add')}
              className="mt-2 bg-dark text-white rounded-[10px] px-5 py-2.5 text-[13px] font-medium hover:opacity-90 transition-opacity">
              Add first item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-appbg pb-24 lg:pb-10 animate-fadeIn">
      <div className="max-w-[640px] mx-auto px-4 lg:px-8 pt-6 lg:pt-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-[8px] bg-surface flex items-center justify-center hover:bg-appbg transition-colors shrink-0"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
            <ArrowLeft size={16} className="text-dark" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-dark leading-tight">Analytics</h1>
            <p className="text-[12px] text-muted mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
        </div>

        {/* ── Today ────────────────────────────────── */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Today</p>
        <div className="bento-tile mb-4">
          {stats.todayItems.length === 0 ? (
            <p className="text-[14px] text-muted">Nothing scheduled for today.</p>
          ) : (
            <>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[32px] font-semibold text-dark leading-none">
                    {stats.todayDone.length}
                    <span className="text-[18px] text-muted font-normal"> / {stats.todayItems.length}</span>
                  </p>
                  <p className="text-[13px] text-secondary mt-1">
                    {stats.todayDone.length === 0
                      ? 'Nothing marked done yet'
                      : stats.todayRemaining.length === 0
                      ? 'All done for today!'
                      : `${stats.todayRemaining.length} item${stats.todayRemaining.length > 1 ? 's' : ''} still to go`}
                  </p>
                </div>
                <span
                  className="text-[22px] font-semibold leading-none"
                  style={{ color: todayPct === 100 ? '#1A7A4A' : todayPct > 0 ? '#1A1A1A' : '#A8A8A8' }}
                >
                  {todayPct}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-appbg overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${todayPct}%`,
                    background: todayPct === 100 ? '#1A7A4A' : '#1A1A1A',
                  }}
                />
              </div>
              {stats.todayRemaining.length > 0 && (
                <div className="mt-3 space-y-1">
                  {stats.todayRemaining.slice(0, 3).map(i => (
                    <div key={i.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                      <span className="text-[12px] text-secondary truncate">{i.title}</span>
                    </div>
                  ))}
                  {stats.todayRemaining.length > 3 && (
                    <p className="text-[11px] text-muted pl-3.5">+{stats.todayRemaining.length - 3} more</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Last 7 days bar chart ─────────────────── */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Last 7 days</p>
        <div className="bento-tile mb-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[26px] font-semibold text-dark leading-none">
                {stats.weekDone}
                <span className="text-[15px] text-muted font-normal"> / {stats.weekTotal} done</span>
              </p>
              <p className="text-[12px] text-muted mt-0.5">{weekPct}% completion rate this week</p>
            </div>
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-16">
            {stats.perDay.map(d => {
              const totalH = barMax === 0 ? 0 : Math.round((d.total / barMax) * 100);
              const doneH  = d.total === 0 ? 0 : Math.round((d.done  / d.total)  * totalH);
              const isToday = d.dateStr === todayStr;
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse rounded-[4px] overflow-hidden" style={{ height: '44px', background: '#F2F2EF' }}>
                    {d.total > 0 && (
                      <div
                        className="w-full rounded-[4px] transition-all"
                        style={{
                          height: `${totalH}%`,
                          background: '#DEDBD5',
                          position: 'relative',
                        }}
                      >
                        {d.done > 0 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-[4px]"
                            style={{
                              height: `${doneH}%`,
                              background: isToday ? '#1A7A4A' : '#1A1A1A',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isToday ? '#1A1A1A' : '#A8A8A8' }}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-dark" />
              <span className="text-[11px] text-muted">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: '#DEDBD5' }} />
              <span className="text-[11px] text-muted">Scheduled</span>
            </div>
          </div>
        </div>

        {/* ── Items by type ─────────────────────────── */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Schedule breakdown</p>
        <div className="bento-tile mb-4">
          {Object.entries(TYPE_META).map(([type, meta], idx, arr) => {
            const count = stats.byType[type] || 0;
            const barPct = pct(count, items.length);
            return (
              <div
                key={type}
                className="flex items-center gap-3 py-3"
                style={idx < arr.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.06)' } : {}}
              >
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                  <meta.Icon size={13} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-dark">{meta.label}</span>
                    <span className="text-[12px] text-muted">{count} item{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2F2EF' }}>
                    <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: '#1A1A1A', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Conflicts ─────────────────────────────── */}
        {conflicts.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Conflicts</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bento-tile">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-orange" />
                  <span className="text-[12px] font-medium text-dark">Unresolved</span>
                </div>
                <p className="text-[28px] font-semibold text-dark leading-none">{stats.unresolved}</p>
                {stats.unresolved > 0 && (
                  <button
                    onClick={() => navigate('/home')}
                    className="mt-3 text-[11px] font-medium text-orange underline"
                  >
                    Review now
                  </button>
                )}
              </div>
              <div className="bento-tile">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-dark" />
                  <span className="text-[12px] font-medium text-dark">Resolved</span>
                </div>
                <p className="text-[28px] font-semibold text-dark leading-none">{stats.resolved}</p>
                <p className="text-[11px] text-muted mt-1">
                  {pct(stats.resolved, conflicts.length)}% resolution rate
                </p>
              </div>
            </div>

            {stats.topConflicted.length > 0 && (
              <>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Most conflicted items</p>
                <div className="bento-tile mb-4">
                  {stats.topConflicted.map(([title, count], i) => (
                    <div
                      key={title}
                      className="flex items-center justify-between gap-3 py-2.5"
                      style={i < stats.topConflicted.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.06)' } : {}}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-semibold text-muted w-4 shrink-0">{i + 1}</span>
                        <span className="text-[13px] text-dark truncate">{title}</span>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: '#FDF1EF', color: '#C44030' }}
                      >
                        {count}×
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
