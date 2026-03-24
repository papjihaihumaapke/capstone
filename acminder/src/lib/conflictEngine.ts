import { format, addWeeks, isAfter, startOfDay } from 'date-fns';
import type { ScheduleItem, Conflict, ShiftItem, ClassItem, AssignmentItem } from '../types';

/**
 * Normalizes an incoming date string to strictly 'YYYY-MM-DD'.
 * Throws a descriptive Error if the date is malformed or invalid.
 */
export function normalizeDate(dateStr: string): string {
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) throw new Error(`Invalid date format for ${dateStr}. Expected YYYY-MM-DD.`);
  const dateStrSafe = `${match[1]}-${match[2]}-${match[3]}`;
  const dt = new Date(dateStrSafe + 'T00:00:00');
  if (Number.isNaN(dt.getTime())) throw new Error(`Invalid date value: ${dateStr}`);
  return dateStrSafe;
}

/**
 * Validates 'HH:MM' time string and rejects out of bounds values.
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

/**
 * Parses and strictly validates a raw object against the ScheduleItem discriminated union.
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

  throw new Error(`Unknown ScheduleItem type: ${raw.type}`);
}

type Interval = {
  item: ScheduleItem;
  startMinutes: number;
  endMinutes: number;
  dateStr: string;
};

export function expandRecurringDates(item: ClassItem | ShiftItem, windowWeeks = 8): string[] {
  const baseDateStr = normalizeDate(item.date);
  const dates = [baseDateStr];
  if (!item.repeats_weekly) return dates;
  
  const today = startOfDay(new Date());
  const maxDate = addWeeks(today, windowWeeks);
  
  let current = new Date(`${baseDateStr}T00:00:00`);
  while (true) {
    current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days exactly
    if (isAfter(current, maxDate)) break;
    dates.push(format(current, 'yyyy-MM-dd'));
  }
  return dates;
}

function getIntervals(item: ScheduleItem): Interval[] {
  if (isAssignment(item)) {
     const d = item.due_date || item.date;
     const t = item.due_time || item.start_time;
     if (!d || !t) return [];
     const startMinutes = timeToMinutes(t);
     return [{ item, startMinutes, endMinutes: startMinutes, dateStr: normalizeDate(d) }];
  }
  
  if (isShift(item) || isClass(item)) {
    let startMinutes = timeToMinutes(item.start_time);
    let endMinutes = timeToMinutes(item.end_time);
    
    // Handle overnight shifts crossing midnight
    if (endMinutes < startMinutes) {
      endMinutes += 1440;
    }
    
    const dates = expandRecurringDates(item as any);
    return dates.map(d => ({ item, startMinutes, endMinutes, dateStr: d }));
  }
  
  return [];
}

export function intervalsOverlap(a: Interval, b: Interval): { severity: 'none' | 'minor' | 'critical'; start?: number; end?: number } {
   if (a.dateStr !== b.dateStr) return { severity: 'none' }; 
   
   if (a.startMinutes === a.endMinutes || b.startMinutes === b.endMinutes) {
      const pt = a.startMinutes === a.endMinutes ? a : b;
      const iv = a.startMinutes === a.endMinutes ? b : a;
      
      if (iv.startMinutes === iv.endMinutes) {
        if (pt.startMinutes === iv.startMinutes) return { severity: 'critical', start: pt.startMinutes, end: pt.startMinutes };
        const gap = Math.abs(pt.startMinutes - iv.startMinutes);
        if (gap > 0 && gap <= 60) return { severity: 'minor', start: Math.min(pt.startMinutes, iv.startMinutes), end: Math.max(pt.startMinutes, iv.startMinutes) };
        return { severity: 'none' };
      }
      
      if (pt.startMinutes >= iv.startMinutes && pt.startMinutes <= iv.endMinutes) {
        return { severity: 'critical', start: pt.startMinutes, end: pt.startMinutes };
      }
      const gap = Math.min(Math.abs(pt.startMinutes - iv.startMinutes), Math.abs(pt.startMinutes - iv.endMinutes));
      if (gap > 0 && gap <= 60) {
        if (pt.startMinutes < iv.startMinutes) return { severity: 'minor', start: pt.startMinutes, end: iv.startMinutes };
        return { severity: 'minor', start: iv.endMinutes, end: pt.startMinutes };
      }
      return { severity: 'none' };
   }
   
   const maxStart = Math.max(a.startMinutes, b.startMinutes);
   const minEnd = Math.min(a.endMinutes, b.endMinutes);
   
   if (maxStart < minEnd) {
     return { severity: 'critical', start: maxStart, end: minEnd };
   }
   
   const gap = Math.max(a.startMinutes - b.endMinutes, b.startMinutes - a.endMinutes);
   if (gap >= 0 && gap <= 60) {
      if (a.startMinutes > b.endMinutes) return { severity: 'minor', start: b.endMinutes, end: a.startMinutes };
      return { severity: 'minor', start: a.endMinutes, end: b.startMinutes };
   }
   
   return { severity: 'none' };
}

function minsToTimeStr(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Robust conflict engine entrypoint. 
 * Converts items to unified intervals (expanding recurrences and handling overnights),
 * then compares mathematically, deduplicating collisions.
 */
export function calculateConflicts(items: ScheduleItem[]): Conflict[] {
   const flatIntervals: Interval[] = [];
   const dedupeMap = new Map<string, Conflict>();

   for (const raw of items) {
      try {
        const item = validateScheduleItem(raw);
        flatIntervals.push(...getIntervals(item));
      } catch (e) {
        console.warn(`Skipping invalid item: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
   }
   
   for (let i = 0; i < flatIntervals.length; i++) {
     for (let j = i + 1; j < flatIntervals.length; j++) {
       const invA = flatIntervals[i];
       const invB = flatIntervals[j];
       
       if (invA.item.id === invB.item.id) continue;
       
       const { severity, start, end } = intervalsOverlap(invA, invB);
       if (severity === 'none') continue;
       
       const idPair = [invA.item.id, invB.item.id].sort().join('|');
       
       const existing = dedupeMap.get(idPair);
       // Overwrite if new severity is critical over a previous minor
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