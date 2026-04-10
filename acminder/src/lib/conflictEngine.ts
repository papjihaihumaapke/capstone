import { format, addWeeks, startOfDay } from 'date-fns';
import type { ScheduleItem, Conflict, ShiftItem, ClassItem, AssignmentItem, RoutineItem } from '../types';

/**
 * Normalizes an incoming date string to strictly 'YYYY-MM-DD'.
 */
export function normalizeDate(dateStr: string): string {
  const match = dateStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) throw new Error(`Invalid date format for ${dateStr}. Expected YYYY-MM-DD.`);
  const month = String(Number(match[2])).padStart(2, '0');
  const day = String(Number(match[3])).padStart(2, '0');
  const dateStrSafe = `${match[1]}-${month}-${day}`;
  const dt = new Date(dateStrSafe + 'T00:00:00');
  if (Number.isNaN(dt.getTime())) throw new Error(`Invalid date value: ${dateStr}`);
  return dateStrSafe;
}

/**
 * Validates 'HH:MM' time string.
 */
export function validateTime(timeStr: string): string {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) throw new Error(`Invalid time format for ${timeStr}. Expected HH:MM.`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) throw new Error(`Time out of range: ${timeStr}`);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timeToMinutes(timeStr: string): number {
  const validated = validateTime(timeStr);
  const [h, m] = validated.split(':').map(Number);
  return h * 60 + m;
}

// Discriminant type guards
export function isShift(item: ScheduleItem): item is ShiftItem {
  return item.type === 'shift';
}
export function isClass(item: ScheduleItem): item is ClassItem {
  return item.type === 'class';
}
export function isAssignment(item: ScheduleItem): item is AssignmentItem {
  return item.type === 'assignment';
}
export function isRoutine(item: ScheduleItem): item is RoutineItem {
  return item.type === 'routine';
}

/**
 * Validates a raw object against the ScheduleItem discriminated union.
 */
export function validateScheduleItem(raw: any): ScheduleItem {
  if (!raw || typeof raw !== 'object') throw new Error('ScheduleItem must be an object');
  if (typeof raw.id !== 'string' || typeof raw.user_id !== 'string' || typeof raw.title !== 'string') {
    throw new Error('ScheduleItem missing required base fields (id, user_id, title)');
  }

  if (raw.type === 'shift') {
    if (typeof raw.date !== 'string') throw new Error('Shift requires a date');
    if (typeof raw.start_time !== 'string' || typeof raw.end_time !== 'string') throw new Error('Shift requires start_time and end_time');
    return {
      ...raw,
      type: 'shift',
      date: normalizeDate(raw.date),
      start_time: validateTime(raw.start_time),
      end_time: validateTime(raw.end_time)
    } as ShiftItem;
  }
  
  if (raw.type === 'class') {
    if (typeof raw.date !== 'string') throw new Error('Class requires a date');
    if (typeof raw.start_time !== 'string' || typeof raw.end_time !== 'string') throw new Error('Class requires start_time and end_time');
    return {
      ...raw,
      type: 'class',
      date: normalizeDate(raw.date),
      start_time: validateTime(raw.start_time),
      end_time: validateTime(raw.end_time)
    } as ClassItem;
  }
  
  if (raw.type === 'assignment') {
    const d = raw.due_date || raw.date;
    const t = raw.due_time || raw.start_time;
    if (typeof d !== 'string') throw new Error('Assignment requires a due_date');
    if (typeof t !== 'string') throw new Error('Assignment requires a due_time');
    return {
      ...raw,
      type: 'assignment',
      due_date: normalizeDate(d),
      due_time: validateTime(t)
    } as AssignmentItem;
  }

  if (raw.type === 'routine') {
    if (typeof raw.date !== 'string') throw new Error('Routine requires a baseline date');
    if (typeof raw.start_time !== 'string' || typeof raw.end_time !== 'string') throw new Error('Routine requires start_time and end_time');
    return {
      ...raw,
      type: 'routine',
      date: normalizeDate(raw.date),
      start_time: validateTime(raw.start_time),
      end_time: validateTime(raw.end_time),
      repeats_weekly: true
    } as RoutineItem;
  }

  throw new Error(`Unknown ScheduleItem type: ${raw.type}`);
}

type Interval = {
  item: ScheduleItem;
  startMinutes: number;
  endMinutes: number;
  dateStr: string;
};

export function expandRecurringDates(item: ClassItem | ShiftItem | RoutineItem, windowWeeks = 8): string[] {
  const baseDateStr = normalizeDate(item.date);
  if (!item.repeats_weekly) return [baseDateStr];

  const today = startOfDay(new Date());
  const maxDate = addWeeks(today, windowWeeks);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  const baseMs = new Date(`${baseDateStr}T00:00:00`).getTime();
  const todayMs = today.getTime();
  const maxMs = maxDate.getTime();

  let currentMs = baseMs;
  if (currentMs < todayMs) {
    const weeksToSkip = Math.ceil((todayMs - currentMs) / msPerWeek);
    currentMs = baseMs + weeksToSkip * msPerWeek;
  }

  const dates: string[] = [];
  while (currentMs <= maxMs) {
    dates.push(format(new Date(currentMs), 'yyyy-MM-dd'));
    currentMs += msPerWeek;
  }
  return dates;
}

function getIntervals(item: ScheduleItem): Interval[] {
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');

  if (isAssignment(item)) {
    const d = item.due_date || item.date;
    const t = item.due_time || item.start_time;
    if (!d || !t) return [];
    const dateStr = normalizeDate(d);
    if (dateStr < todayStr) return [];
    const startMinutes = timeToMinutes(t);
    return [{ item, startMinutes, endMinutes: startMinutes, dateStr }];
  }

  if (isShift(item) || isClass(item) || isRoutine(item)) {
    let startMinutes = timeToMinutes(item.start_time);
    let endMinutes = timeToMinutes(item.end_time);

    if (endMinutes < startMinutes) {
      endMinutes += 1440; // Overnight
    }

    const dates = expandRecurringDates(item as any);
    return dates
      .filter(d => d >= todayStr)
      .map(d => ({ item, startMinutes, endMinutes, dateStr: d }));
  }

  return [];
}

export function intervalsOverlap(a: Interval, b: Interval): { severity: 'none' | 'minor' | 'critical'; start?: number; end?: number } {
   const getAbs = (iv: Interval) => {
      const d = new Date(iv.dateStr + 'T00:00:00').getTime() / 60000;
      return { start: d + iv.startMinutes, end: d + iv.endMinutes };
   };

   const absA = getAbs(a);
   const absB = getAbs(b);
   
   if (a.startMinutes === a.endMinutes || b.startMinutes === b.endMinutes) {
      const pt = a.startMinutes === a.endMinutes ? absA : absB;
      const iv = a.startMinutes === a.endMinutes ? absB : absA;
      
      if (iv.start === iv.end) {
        if (pt.start === iv.start) return { severity: 'critical', start: a.startMinutes, end: a.startMinutes };
        const gap = Math.abs(pt.start - iv.start);
        if (gap > 0 && gap <= 60) return { severity: 'minor', start: Math.min(a.startMinutes, b.startMinutes), end: Math.max(a.startMinutes, b.startMinutes) };
        return { severity: 'none' };
      }
      
      if (pt.start >= iv.start && pt.start <= iv.end) {
        return { severity: 'critical', start: a.startMinutes, end: a.startMinutes };
      }
      const gap = Math.min(Math.abs(pt.start - iv.start), Math.abs(pt.start - iv.end));
      if (gap > 0 && gap <= 60) {
        return { severity: 'minor', start: a.startMinutes, end: a.startMinutes };
      }
      return { severity: 'none' };
   }
   
   const maxStart = Math.max(absA.start, absB.start);
   const minEnd = Math.min(absA.end, absB.end);
   
   if (maxStart < minEnd) {
     return { severity: 'critical', start: maxStart % 1440, end: minEnd % 1440 };
   }
   
   const gap = Math.max(absA.start - absB.end, absB.start - absA.end);
   if (gap >= 0 && gap <= 60) {
      return { severity: 'minor' };
   }
   
   return { severity: 'none' };
}

function minsToTimeStr(mins: number): string {
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateConflicts(items: ScheduleItem[]): Conflict[] {
   const flatIntervals: Interval[] = [];
   const dedupeMap = new Map<string, Conflict>();

   for (const raw of items) {
      try {
        if ((raw as any).completed) continue;
        const item = validateScheduleItem(raw);
        flatIntervals.push(...getIntervals(item));
      } catch (e) { /* ignore */ }
   }

   flatIntervals.sort((a, b) => {
     const dDiff = a.dateStr.localeCompare(b.dateStr);
     if (dDiff !== 0) return dDiff;
     return a.startMinutes - b.startMinutes;
   });
   
   for (let i = 0; i < flatIntervals.length; i++) {
     for (let j = i + 1; j < flatIntervals.length; j++) {
       const invA = flatIntervals[i];
       const invB = flatIntervals[j];
       if (invA.item.id === invB.item.id) continue;
       
       const { severity, start, end } = intervalsOverlap(invA, invB);
       if (severity === 'none') {
          const d1 = new Date(invA.dateStr + 'T00:00:00').getTime();
          const d2 = new Date(invB.dateStr + 'T00:00:00').getTime();
          if (d2 - d1 > 172800000) break;
          continue;
       }
       
       const idPair = [invA.item.id, invB.item.id].sort().join('|') + '|' + invA.dateStr;
       const existing = dedupeMap.get(idPair);
       if (!existing || (existing.severity === 'minor' && severity === 'critical')) {
           dedupeMap.set(idPair, {
               id: idPair,
               item_a: invA.item,
               item_b: invB.item,
               resolved: false,
               severity,
               date: invA.dateStr,
               overlap_start: start !== undefined ? minsToTimeStr(start) : undefined,
               overlap_end: end !== undefined ? minsToTimeStr(end) : undefined
           });
       }
     }
   }
   return Array.from(dedupeMap.values());
}

export function itemOccursOnDate(item: ScheduleItem, targetDateStr: string) {
  if (item.type === 'assignment') {
    const d = item.due_date || item.date;
    return d === targetDateStr;
  }
  if ((item.type === 'class' || item.type === 'shift' || item.type === 'routine') && item.repeats_weekly) {
    if (targetDateStr < item.date) return false;
    const targetDay = new Date(targetDateStr + 'T00:00:00').getDay();
    const itemDay = new Date(item.date + 'T00:00:00').getDay();
    return targetDay === itemDay;
  }
  return item.date === targetDateStr;
}