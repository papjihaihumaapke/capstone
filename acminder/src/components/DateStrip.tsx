import { useMemo } from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';

interface DateStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DateStrip({ selectedDate, onDateSelect }: DateStripProps) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 2));
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mb-4">
      {days.map((day) => {
        const isActive = isSameDay(day, selectedDate);
        const todayDay = isToday(day);
        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onDateSelect(day)}
            className={`flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-2xl transition-all shrink-0 ${
              isActive
                ? 'bg-primary text-white shadow-blue'
                : todayDay
                ? 'bg-primaryLight primary border border-primary/20'
                : 'bg-white border border-border text-primary hover:border-primary/30'
            }`}
          >
            <span className={`text-lg font-bold leading-none ${
              isActive ? 'text-white' : todayDay ? 'primary' : 'text-primary'
            }`}>
              {format(day, 'd')}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wide ${
              isActive ? 'text-white/80' : todayDay ? 'primary/70' : 'text-secondary'
            }`}>
              {format(day, 'EEE')}
            </span>
            {todayDay && !isActive && (
              <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
