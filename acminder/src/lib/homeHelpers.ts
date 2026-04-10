import type { Conflict, ScheduleItem } from '../types';

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function getConflictDateStr(c: Conflict) {
  return c.date || '';
}

export function overlapLabel(c: Conflict) {
  if (!c.overlap_start || !c.overlap_end) return '';
  const format12 = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  if (c.overlap_start === c.overlap_end) return format12(c.overlap_start);
  return `${format12(c.overlap_start)} - ${format12(c.overlap_end)}`;
}

export function mitigationIdea(c: Conflict) {
  const a = c.item_a;
  const b = c.item_b;
  const weeklyClassInvolved = (a.type === 'class' && !!a.repeats_weekly) || (b.type === 'class' && !!b.repeats_weekly);

  const isMovableShift = (item: ScheduleItem) => item.type === 'shift';
  const isMovableClass = (item: ScheduleItem) => item.type === 'class' && !item.repeats_weekly;
  const isMovableAssignment = (item: ScheduleItem) => item.type === 'assignment';

  const prefer =
    isMovableShift(a) ? a : isMovableShift(b) ? b : isMovableClass(a) ? a : isMovableClass(b) ? b : isMovableAssignment(a) ? a : isMovableAssignment(b) ? b : null;

  const overlap = overlapLabel(c);
  const overlapPart = overlap ? `around ${overlap}` : '';

  if (weeklyClassInvolved && prefer?.type === 'shift')
    return `Mitigate ${overlapPart}: this conflict is tied to a weekly class, so adjust your shift time earlier/later.`;
  if (weeklyClassInvolved && prefer?.type === 'assignment')
    return `Mitigate ${overlapPart}: weekly class repeats, so adjust the assignment due time or reschedule the shift.`;
  if (prefer?.type === 'shift')
    return `Mitigate ${overlapPart}: shift the shift by 15\u201360 minutes to remove the overlap.`;
  if (prefer?.type === 'class')
    return `Mitigate ${overlapPart}: adjust the class time (only if it's not weekly) or move the shift.`;
  if (prefer?.type === 'assignment')
    return `Mitigate ${overlapPart}: if you can, adjust the assignment time or move the conflicting shift/class.`;

  return `Mitigate ${overlapPart}: review schedules and add buffer before the conflict.`;
}

export function getDoneCount(userId: string): number {
  if (!userId) return 0;
  try { return new Set(JSON.parse(localStorage.getItem(`acminder_done_items_${userId}`) || '[]')).size; } catch { return 0; }
}
