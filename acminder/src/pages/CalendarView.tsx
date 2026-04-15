import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MiniCalendar from '../components/MiniCalendar';
import ScheduleItemCard from '../components/ScheduleItemCard';
import { AppContext } from '../context/AppContext';
import { itemOccursOnDate } from '../lib/conflictEngine';

export default function CalendarView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ctx = useContext(AppContext);
  const { items, conflicts } = ctx || {};

  const [selectedDate, setSelectedDate] = useState(new Date());

  const qpDate = useMemo(() => searchParams.get('date'), [searchParams]);
  useEffect(() => {
    if (!qpDate) return;
    const next = new Date(`${qpDate}T00:00:00`);
    if (!Number.isNaN(next.getTime())) setSelectedDate(next);
  }, [qpDate]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayItems = (items || [])
    .filter(i => itemOccursOnDate(i, selectedDateStr))
    .sort((a, b) => {
      const tA = a.type === 'assignment' ? (a.due_time || a.start_time || '') : (a.start_time || '');
      const tB = b.type === 'assignment' ? (b.due_time || b.start_time || '') : (b.start_time || '');
      return tA.localeCompare(tB);
    });

  const sectionTitle = isToday(selectedDate)
    ? "Today's schedule"
    : format(selectedDate, 'EEEE, MMMM d');

  const getConflictSeverity = (itemId: string) => {
    const c = (conflicts || []).find(c => (c.item_a.id === itemId || c.item_b.id === itemId) && !c.resolved);
    return c ? (c.severity || 'critical') : 'none';
  };

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-24 lg:pb-10">
      <div className="max-w-[960px] mx-auto px-4 lg:px-8 pt-6 lg:pt-10">

        {/* Desktop: 2-col — calendar left, schedule right */}
        <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-8 lg:items-start">

          {/* ── Left: month nav + mini calendar ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedDate(d => addMonths(d, -1))}
                className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-[10px] text-dark hover:bg-appbg active:scale-95 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-[17px] font-semibold text-dark">
                {format(selectedDate, 'MMMM yyyy')}
              </h1>
              <button
                onClick={() => setSelectedDate(d => addMonths(d, 1))}
                className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-[10px] text-dark hover:bg-appbg active:scale-95 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="bento-tile">
              <MiniCalendar
                items={items || []}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Today button — desktop only */}
            {!isToday(selectedDate) && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="hidden lg:block w-full mt-3 py-2.5 rounded-[10px] text-[13px] font-medium text-muted hover:text-dark hover:bg-surface transition-colors text-center border border-border"
              >
                Back to today
              </button>
            )}
          </div>

          {/* ── Right: selected day schedule ── */}
          <div className="mt-6 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold text-dark">{sectionTitle}</h2>
                <p className="text-[12px] text-muted mt-0.5">{dayItems.length} item{dayItems.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => navigate(`/add?date=${selectedDateStr}`)}
                className="w-8 h-8 rounded-[10px] bg-dark text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                aria-label="Add item for this date"
              >
                <Plus size={15} />
              </button>
            </div>

            {dayItems.length === 0 ? (
              <div className="bento-tile flex flex-col items-center py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-[14px] bg-appbg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-dark">Nothing scheduled</p>
                <p className="text-[12px] text-muted">No events on this day.</p>
                <button
                  onClick={() => navigate(`/add?date=${selectedDateStr}`)}
                  className="mt-1 bg-dark text-white rounded-[10px] px-5 py-2.5 text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add item
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {dayItems.map(item => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    userId={ctx?.user?.id || ''}
                    conflictSeverity={getConflictSeverity(item.id)}
                    onClick={() => navigate(`/item/${item.id}`)}
                    onMarkDone={() => ctx?.updateItem?.(item.id, { completed: true })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
