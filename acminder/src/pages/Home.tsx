import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import NotificationsPanel from '../components/NotificationsPanel';
import FeaturedConflictCard from '../components/FeaturedConflictCard';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay, isToday } from 'date-fns';
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

  // Auto-sync Google Calendar silently on load (1-hour cooldown, no toast spam)
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

  // greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const email = ctx?.user?.email || '';
  const firstName = (() => {
    const raw = email.split('@')[0] || 'there';
    return raw.charAt(0).toUpperCase() + raw.slice(1).split(/[._]/)[0];
  })();

  // days with events for dot indicator
  const days = useMemo(() => buildDayStrip(items || [], selStr), []);
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
    <div style={{ background: '#F2F3F7', minHeight: '100dvh', fontFamily: '-apple-system, "SF Pro Display", sans-serif', position: 'relative', overflowX: 'hidden' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 110 }}>

        {/* ── STATUS BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0D0D0D' }}>9:41</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.55 }}>
            {/* Signal */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="1" fill="#0D0D0D"/>
              <rect x="4.5" y="5" width="3" height="7" rx="1" fill="#0D0D0D"/>
              <rect x="9" y="2" width="3" height="10" rx="1" fill="#0D0D0D"/>
              <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="#0D0D0D"/>
            </svg>
            {/* Wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#0D0D0D"/>
              <path d="M5.2 7.5A4 4 0 0 1 8 6.5a4 4 0 0 1 2.8 1" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M2.8 5A7 7 0 0 1 8 3a7 7 0 0 1 5.2 2" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M0.5 2.5A10.5 10.5 0 0 1 8 0a10.5 10.5 0 0 1 7.5 2.5" stroke="#0D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {/* Battery */}
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="#0D0D0D" strokeWidth="1"/>
              <rect x="2" y="2" width="13" height="8" rx="1.5" fill="#0D0D0D"/>
              <path d="M19.5 4v4" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
          <div>
            <div style={{ fontSize: 13, color: '#888888', fontWeight: 400, lineHeight: 1.3 }}>{greeting}</div>
            <div style={{ fontSize: 18, color: '#0D0D0D', fontWeight: 600, lineHeight: 1.3 }}>{firstName}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            <button
              type="button"
              onClick={() => nav('/calendar')}
              aria-label="Calendar"
              style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', border: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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
              style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', border: '0.5px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {clashN > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, background: '#E8470A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {clashN > 9 ? '9+' : clashN}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationsPanel conflicts={conflicts || []} onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>

        {/* ── DATE SECTION ── */}
        <div style={{ padding: '22px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#0D0D0D' }}>{format(selDate, 'MMMM')}</span>
            <span style={{ fontSize: 22, fontWeight: 400, color: '#BBBCBF' }}>{format(selDate, 'yyyy')}</span>
          </div>

          {/* Day strip */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {days.map(day => {
              const ds = format(day, 'yyyy-MM-dd');
              const isActive = isSameDay(day, selDate);
              const hasEvents = daysWithEvents.has(ds);

              return (
                <button
                  key={ds}
                  type="button"
                  onClick={() => setSelDate(day)}
                  style={{
                    width: 44,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    gap: 3,
                    background: isActive ? '#0D0D0D' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: isActive ? 'rgba(255,255,255,0.6)' : '#AAAAAA', fontWeight: 500 }}>
                    {format(day, 'EEE')}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: isActive ? '#FFFFFF' : '#0D0D0D', lineHeight: 1 }}>
                    {format(day, 'd')}
                  </span>
                  {/* dot */}
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: isActive
                      ? 'rgba(255,255,255,0.5)'
                      : hasEvents
                      ? '#E8470A'
                      : 'transparent',
                    marginTop: 1,
                    display: 'block',
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '18px 20px 0' }}>
          {/* Tasks */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px 12px', border: '0.5px solid #F0F0F0' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0D0D0D', lineHeight: 1 }}>{todaysItems.length}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#AAAAAA', marginTop: 4 }}>TASKS</div>
            <div style={{ fontSize: 10, color: '#CCCCCC', marginTop: 2 }}>Today</div>
          </div>
          {/* Conflicts — accent */}
          <div style={{ background: '#E8470A', borderRadius: 18, padding: '14px 12px', border: '0.5px solid #E8470A' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>{clashN}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>CONFLICTS</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Issues</div>
          </div>
          {/* Done */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '14px 12px', border: '0.5px solid #F0F0F0' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0D0D0D', lineHeight: 1 }}>{completed.length}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#AAAAAA', marginTop: 4 }}>DONE</div>
            <div style={{ fontSize: 10, color: '#CCCCCC', marginTop: 2 }}>Finished</div>
          </div>
        </div>

        {/* ── SMART INSIGHTS (conflicts) ── */}
        {(clashN > 0 || dayConflict) && (
          <div style={{ padding: '18px 20px 0' }}>
            {dayConflict ? (
              <FeaturedConflictCard
                conflict={dayConflict}
                totalCount={clashN}
                onClick={() => nav(`/conflict/${dayConflict.id}`)}
              />
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}>
                {fc.map(({ c, dateStr }) => (
                  <div
                    key={c.id}
                    onClick={() => nav(`/conflict/${c.id}`)}
                    style={{ minWidth: 260, background: '#fff', borderRadius: 18, padding: '14px 16px', border: '0.5px solid #F0F0F0', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#E8470A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{format(new Date(`${dateStr}T00:00:00`), 'MMM d')}</span>
                      <span style={{ fontSize: 10, color: '#CCCCCC' }}>•</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase' }}>{c.severity} overlap</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.item_a.title} vs {c.item_b.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE SECTION HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 20px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', textTransform: 'uppercase', letterSpacing: '0.3px' }}>TIMELINE</span>
          <button
            type="button"
            onClick={() => nav('/calendar')}
            style={{ fontSize: 12, fontWeight: 500, color: '#E8470A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            View full →
          </button>
        </div>

        {/* ── FILTER PILLS ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '14px 20px 0', paddingRight: 0 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === f.key ? '#0D0D0D' : '#FFFFFF',
                color: filter === f.key ? '#FFFFFF' : '#888888',
                border: filter === f.key ? 'none' : '0.5px solid #EBEBEB',
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ width: 20, flexShrink: 0 }} />
        </div>

        {/* ── SCHEDULE LIST / EMPTY STATE ── */}
        <div style={{ padding: '16px 20px 0' }}>
          {onProgress.length === 0 && completed.length === 0 ? (
            /* Empty state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D', marginTop: 4 }}>Nothing scheduled</div>
              <div style={{ fontSize: 13, color: '#AAAAAA', textAlign: 'center' }}>Add items to start building your day</div>
              <button
                onClick={() => nav('/add')}
                style={{ marginTop: 8, background: '#0D0D0D', color: '#FFFFFF', fontSize: 13, fontWeight: 500, padding: '10px 22px', borderRadius: 20, border: 'none', cursor: 'pointer' }}
              >
                + Add item
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0D0D0D', textTransform: 'uppercase', letterSpacing: '0.3px' }}>COMPLETED</span>
                    <span style={{ fontSize: 12, color: '#AAAAAA' }}>{completed.length} items</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => nav('/add')}
        aria-label="Add new item"
        style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 18,
          background: '#E8470A',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        {/* Plus icon */}
        <div style={{ position: 'relative', width: 14, height: 14 }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: 14, height: 2, background: '#fff', borderRadius: 2, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: 14, background: '#fff', borderRadius: 2, transform: 'translateX(-50%)' }} />
        </div>
      </button>
    </div>
  );
}
