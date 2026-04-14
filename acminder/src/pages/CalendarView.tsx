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
    if (!Number.isNaN(next.getTime())) {
      setSelectedDate(next);
    }
  }, [qpDate]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todaysItems = (items || [])
    .filter(i => itemOccursOnDate(i, selectedDateStr))
    .sort((a, b) => {
      const timeA = a.type === 'assignment' ? (a.due_time || a.start_time || '') : a.start_time;
      const timeB = b.type === 'assignment' ? (b.due_time || b.start_time || '') : b.start_time;
      return timeA.localeCompare(timeB);
    });

  const sectionTitle = isToday(selectedDate) ? "TODAY'S SCHEDULE" : format(selectedDate, 'EEEE, MMMM d');

  const prevMonth = () => setSelectedDate((d) => addMonths(d, -1));
  const nextMonth = () => setSelectedDate((d) => addMonths(d, 1));

  const getConflictSeverity = (itemId: string) => {
    const c = (conflicts || []).find(c => (c.item_a.id === itemId || c.item_b.id === itemId) && !c.resolved);
    return c ? (c.severity || 'critical') : 'none';
  };

  return (
    <div className="relative min-h-screen bg-appbg animate-fadeIn pb-32">
      <div className="max-w-[480px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-8 pb-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-btn text-dark cursor-pointer active:scale-95 transition-transform hover:bg-appbg">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-h2 font-display text-dark">
            {format(selectedDate, 'MMMM yyyy')}
          </h1>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-btn text-dark cursor-pointer active:scale-95 transition-transform hover:bg-appbg">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Card */}
        <div className="px-5 mb-6">
          <div className="bg-surface rounded-card border border-border p-4">
            <MiniCalendar
              items={items || []}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>

        {/* Schedule Section */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-label text-orange tracking-widest">{sectionTitle}</h2>
            <button
              onClick={() => navigate(`/add?date=${selectedDateStr}`)}
              className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-none"
              aria-label="Add item for this date"
            >
              <Plus size={16} />
            </button>
          </div>
          {todaysItems.length === 0 ? (
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
              <div className="text-caption text-muted text-center">No events on this day.</div>
              <button
                onClick={() => navigate(`/add?date=${selectedDateStr}`)}
                className="mt-2 bg-dark text-white rounded-btn px-5 py-2 text-body font-semibold hover:opacity-90 active:scale-95 transition-all shadow-none flex items-center gap-1.5"
              >
                <Plus size={16} /> Add item
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todaysItems.map(item => (
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
  );
}