import { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MiniCalendar from '../components/MiniCalendar';
import ScheduleItemCard from '../components/ScheduleItemCard';
import { AppContext } from '../context/AppContext';

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
  const todaysItems = (items || []).filter(i => i.date === selectedDateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const sectionTitle = isToday(selectedDate) ? "TODAY'S SCHEDULE" : format(selectedDate, 'EEEE, MMMM d');

  const prevMonth = () => setSelectedDate((d) => addMonths(d, -1));
  const nextMonth = () => setSelectedDate((d) => addMonths(d, 1));

  return (
    <div className="relative min-h-screen bg-background animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
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
          <h2 className="text-sm font-semibold text-textSecondary uppercase mb-3">{sectionTitle}</h2>
          {todaysItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl text-gray-300 mb-4">📅</div>
              <div className="text-sm text-gray-500 text-center">No events on this day. Tap + to add one.</div>
            </div>
          ) : (
            <div>
              {todaysItems.map(item => (
                <ScheduleItemCard
                  key={item.id}
                  item={item}
                  hasConflict={!!(conflicts || []).find(c => (c.item_a.id === item.id || c.item_b.id === item.id) && !c.resolved)}
                  onClick={() => navigate(`/item/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}