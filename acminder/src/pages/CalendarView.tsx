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
    <div className="relative min-h-screen bg-background animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white shadow-sm rounded-xl mx-auto max-w-md lg:max-w-none">
          <button onClick={prevMonth}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-display font-bold">
            {format(selectedDate, 'MMMM yyyy')}
          </h1>
          <button onClick={nextMonth}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <MiniCalendar
            items={items || []}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Schedule Section */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-textSecondary uppercase">{sectionTitle}</h2>
            <button
              onClick={() => navigate(`/add?date=${selectedDateStr}`)}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
              aria-label="Add item for this date"
            >
              <Plus size={18} />
            </button>
          </div>
          {todaysItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl text-gray-300 mb-4">📅</div>
              <div className="text-sm text-gray-500 text-center mb-3">No events on this day.</div>
              <button
                onClick={() => navigate(`/add?date=${selectedDateStr}`)}
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primaryDark transition-colors shadow-blue flex items-center gap-1.5"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          ) : (
            <div>
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