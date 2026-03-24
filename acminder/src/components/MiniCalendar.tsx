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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
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
              className={`relative w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors ${
                isSelected ? 'bg-primary text-white' : isTodayDate ? 'bg-primary/20 text-primary' : 'text-textPrimary hover:bg-gray-100'
              }`}
            >
              {format(day, 'd')}
              {hasItem && !isSelected && (
                <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}