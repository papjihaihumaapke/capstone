import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { itemOccursOnDate } from '../lib/conflictEngine';

interface MiniCalendarProps {
  items: any[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function MiniCalendar({ items, selectedDate, onDateSelect }: MiniCalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasItems = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return items.some((item) => itemOccursOnDate(item, dateStr));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[11px] text-muted font-bold tracking-wide uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const hasItem = hasItems(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`relative h-10 w-full flex items-center justify-center text-body rounded-[14px] transition-colors mx-auto ${
                isSelected ? 'bg-dark text-white font-bold' : isTodayDate ? 'bg-border/50 text-dark font-bold' : 'text-dark hover:bg-appbg'
              }`}
            >
              {format(day, 'd')}
              {hasItem && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-orange rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}