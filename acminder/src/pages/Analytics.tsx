import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Briefcase, BookOpen, FileText, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TYPE_META: Record<string, { label: string; Icon: any; color: string; bg: string }> = {
  shift:      { label: 'Work',    Icon: Briefcase, color: '#1A1A1A', bg: '#F2F2EF' },
  class:      { label: 'College', Icon: BookOpen,  color: '#1A1A1A', bg: '#F2F2EF' },
  assignment: { label: 'Task',    Icon: FileText,  color: '#FFFFFF', bg: '#1A1A1A' },
  routine:    { label: 'Habit',   Icon: Clock,     color: '#1A1A1A', bg: '#F2F2EF' },
};

function StatTile({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="bento-tile flex flex-col gap-1">
      <p className="text-[26px] font-semibold text-dark leading-none">{value}</p>
      <p className="text-[13px] font-medium text-dark mt-1">{label}</p>
      {sub && <p className="text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { items, conflicts } = useAppContext();

  const today = startOfDay(new Date());
  const todayStr = toDateStr(today);

  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const monthAgo = new Date(today); monthAgo.setDate(today.getDate() - 29);

  const inRange = (dateStr: string | undefined, from: Date) => {
    if (!dateStr) return false;
    return dateStr >= toDateStr(from) && dateStr <= todayStr;
  };

  const stats = useMemo(() => {
    const completedToday  = items.filter(i => i.completed && (i as any).date === todayStr).length;
    const completedWeek   = items.filter(i => i.completed && inRange((i as any).date, weekAgo)).length;
    const completedMonth  = items.filter(i => i.completed && inRange((i as any).date, monthAgo)).length;

    const totalToday  = items.filter(i => (i as any).date === todayStr).length;
    const totalWeek   = items.filter(i => inRange((i as any).date, weekAgo)).length;
    const totalMonth  = items.filter(i => inRange((i as any).date, monthAgo)).length;

    // Counts by type across all items
    const byType = Object.fromEntries(
      Object.keys(TYPE_META).map(t => [t, items.filter(i => i.type === t).length])
    );

    // Most conflicted items
    const conflictFreq: Record<string, number> = {};
    conflicts.forEach(c => {
      const a = c.item_a?.title; const b = c.item_b?.title;
      if (a) conflictFreq[a] = (conflictFreq[a] || 0) + 1;
      if (b) conflictFreq[b] = (conflictFreq[b] || 0) + 1;
    });
    const topConflicted = Object.entries(conflictFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const resolved   = conflicts.filter(c => c.resolved).length;
    const unresolved = conflicts.filter(c => !c.resolved).length;

    return { completedToday, completedWeek, completedMonth, totalToday, totalWeek, totalMonth, byType, topConflicted, resolved, unresolved };
  }, [items, conflicts, todayStr]);

  const completionRate = (done: number, total: number) =>
    total === 0 ? '—' : `${Math.round((done / total) * 100)}%`;

  return (
    <div className="min-h-[100dvh] bg-appbg pb-24 lg:pb-10 animate-fadeIn">
      <div className="max-w-[640px] mx-auto px-4 lg:px-8 pt-6 lg:pt-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-[8px] bg-surface flex items-center justify-center hover:bg-appbg transition-colors shrink-0"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
          >
            <ArrowLeft size={16} className="text-dark" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-dark leading-tight">Analytics</h1>
            <p className="text-[12px] text-muted mt-0.5">Your schedule at a glance</p>
          </div>
        </div>

        {/* Today */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Today</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatTile value={stats.totalToday} label="Items scheduled" />
          <StatTile
            value={stats.completedToday}
            label="Completed"
            sub={`${completionRate(stats.completedToday, stats.totalToday)} completion`}
          />
        </div>

        {/* This week */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Last 7 days</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatTile value={stats.totalWeek} label="Items scheduled" />
          <StatTile
            value={stats.completedWeek}
            label="Completed"
            sub={`${completionRate(stats.completedWeek, stats.totalWeek)} completion`}
          />
        </div>

        {/* This month */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Last 30 days</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatTile value={stats.totalMonth} label="Items scheduled" />
          <StatTile
            value={stats.completedMonth}
            label="Completed"
            sub={`${completionRate(stats.completedMonth, stats.totalMonth)} completion`}
          />
        </div>

        {/* Items by type */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Items by type</p>
        <div className="bento-tile mb-6 space-y-0 divide-y" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = stats.byType[type] || 0;
            const total = items.length || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={type} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: meta.bg }}
                >
                  <meta.Icon size={13} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-dark">{meta.label}</span>
                    <span className="text-[12px] text-muted">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-appbg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-dark transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conflicts summary */}
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Conflicts</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bento-tile flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={15} className="text-orange shrink-0" />
              <p className="text-[13px] font-medium text-dark">Unresolved</p>
            </div>
            <p className="text-[26px] font-semibold text-dark leading-none">{stats.unresolved}</p>
          </div>
          <div className="bento-tile flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} className="text-dark shrink-0" />
              <p className="text-[13px] font-medium text-dark">Resolved</p>
            </div>
            <p className="text-[26px] font-semibold text-dark leading-none">{stats.resolved}</p>
          </div>
        </div>

        {/* Most conflicted items */}
        {stats.topConflicted.length > 0 && (
          <>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Most conflicted items</p>
            <div className="bento-tile mb-6 space-y-0 divide-y" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              {stats.topConflicted.map(([title, count], i) => (
                <div key={title} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#F2F2EF', color: '#6B6B6B' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-dark truncate">{title}</span>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: '#FDF1EF', color: '#C44030' }}
                  >
                    {count} {count === 1 ? 'conflict' : 'conflicts'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {items.length === 0 && (
          <div className="bento-tile flex flex-col items-center py-12 gap-3 text-center">
            <div className="w-10 h-10 rounded-[12px] bg-appbg flex items-center justify-center">
              <TrendingUp size={18} className="text-muted" />
            </div>
            <p className="text-[14px] font-medium text-dark">No data yet</p>
            <p className="text-[12px] text-muted">Add items to your schedule to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
