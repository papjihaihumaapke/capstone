import type { ScheduleItem, Conflict } from '../types';

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function hasOverlap(shiftStart: string, shiftEnd: string, classStart: string, classEnd: string): boolean {
  const sStart = timeToMinutes(shiftStart);
  const sEnd = timeToMinutes(shiftEnd);
  const cStart = timeToMinutes(classStart);
  const cEnd = timeToMinutes(classEnd);
  return sStart < cEnd && cStart < sEnd;
}

function isAssignment(item: ScheduleItem) {
  return item.type === 'assignment';
}

function getItemDate(item: ScheduleItem): string | undefined {
  return isAssignment(item) ? item.due_date || item.date : item.date;
}

function getItemIntervalMinutes(item: ScheduleItem): { start: number; end: number } | null {
  if (isAssignment(item)) {
    const t = item.due_time || item.start_time;
    if (!t) return null;
    const start = timeToMinutes(t);
    return { start, end: start + 1 }; // point-in-time due moment
  }
  if (!item.start_time || !item.end_time) return null;
  return { start: timeToMinutes(item.start_time), end: timeToMinutes(item.end_time) };
}

function sameWeekday(dateA: string, dateB: string): boolean {
  return new Date(dateA).getDay() === new Date(dateB).getDay();
}

export function calculateConflicts(items: ScheduleItem[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const timeItems = items.filter(i => (i.type === 'shift' || i.type === 'class' || i.type === 'assignment'));

  for (let i = 0; i < timeItems.length; i++) {
    for (let j = i + 1; j < timeItems.length; j++) {
      const a = timeItems[i];
      const b = timeItems[j];

      const aDate = getItemDate(a);
      const bDate = getItemDate(b);
      if (!aDate || !bDate) continue;

      const aInt = getItemIntervalMinutes(a);
      const bInt = getItemIntervalMinutes(b);
      if (!aInt || !bInt) continue;

      const datesMatch =
        aDate === bDate ||
        (a.repeats_weekly && sameWeekday(aDate, bDate)) ||
        (b.repeats_weekly && sameWeekday(aDate, bDate));
      if (!datesMatch) continue;

      const overlaps = aInt.start < bInt.end && bInt.start < aInt.end;
      if (!overlaps) continue;

      const id = [a.id, b.id].sort().join('-');
      conflicts.push({ id, item_a: a, item_b: b, resolved: false });
    }
  }

  return conflicts;
}