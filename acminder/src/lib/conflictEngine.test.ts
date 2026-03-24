// @ts-ignore
import { describe, it, expect } from 'vitest';
import {
  calculateConflicts,
  validateScheduleItem,
  normalizeDate,
  validateTime
} from './conflictEngine';
import type { ShiftItem, AssignmentItem, ClassItem } from '../types';

describe('validateScheduleItem', () => {
  it('rejects malformed time and dates', () => {
    expect(() => validateTime('25:00')).toThrow(/out of range/);
    expect(() => validateTime('10:65')).toThrow(/out of range/);
    expect(() => validateTime('10pm')).toThrow(/Invalid time format/);
    
    expect(() => normalizeDate('2026/03/24')).toThrow(/Invalid date format/);
    expect(() => normalizeDate('2026-13-45')).toThrow(/Invalid date value/);
  });

  it('parses valid shifts, classes, and assignments', () => {
    const rawClass = { id: '1', user_id: 'u1', type: 'class', title: 'Math', date: '2026-03-24', start_time: '10:00', end_time: '11:00' };
    const parsedClass = validateScheduleItem(rawClass);
    expect(parsedClass.type).toBe('class');
    
    const rawAssignment = { id: '2', user_id: 'u1', type: 'assignment', title: 'Essay', due_date: '2026-03-25', due_time: '23:59' };
    const parsedAssignment = validateScheduleItem(rawAssignment);
    expect(parsedAssignment.type).toBe('assignment');
  });
});

describe('calculateConflicts', () => {
  const baseItem = { user_id: 'u1', title: 'Event' };

  it('detects a basic overlap', () => {
    const shift1: ShiftItem = { ...baseItem, id: '1', type: 'shift', date: '2026-03-24', start_time: '10:00', end_time: '14:00' };
    const shift2: ShiftItem = { ...baseItem, id: '2', type: 'shift', date: '2026-03-24', start_time: '12:00', end_time: '16:00' };
    const conflicts = calculateConflicts([shift1, shift2]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('critical');
    expect(conflicts[0].id).toBe('1|2');
  });

  it('handles overnight shifts correctly', () => {
    // 22:00 to 02:00
    const shiftNight: ShiftItem = { ...baseItem, id: 'night', type: 'shift', date: '2026-03-24', start_time: '22:00', end_time: '02:00' };
    // 01:00 to 03:00 (overlaps with the overnight portion on 24th, modeled as 25:00 to 27:00 internally)
    // Wait: if date is 2026-03-24 and time is 01:00, that implies early morning of the 24th.
    // So to overlap an overnight shift, the other shift on the *same day* has to happen late night.
    // Wait, if overnight adds 1440, it's operating on same dateStr.
    // If we have a shift from 23:00 to 03:00 on the same date:
    // These do not overlap because 01:00 is before 22:00.
    
    // Instead, what if there's a shift from 23:30 to 01:30?
    const shiftOverlap: ShiftItem = { ...baseItem, id: 'overlap', type: 'shift', date: '2026-03-24', start_time: '23:30', end_time: '01:30' };
    
    const conflicts = calculateConflicts([shiftNight, shiftOverlap]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('critical');
  });

  it('detects near-miss gaps as minor conflicts', () => {
    const shift1: ShiftItem = { ...baseItem, id: '1', type: 'shift', date: '2026-03-24', start_time: '10:00', end_time: '12:00' };
    const shift2: ShiftItem = { ...baseItem, id: '2', type: 'shift', date: '2026-03-24', start_time: '12:15', end_time: '16:00' }; // 15 min gap
    const conflicts = calculateConflicts([shift1, shift2]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('minor');
  });

  it('deduplicates conflicts pair by pair', () => {
    const valClass: ClassItem = { ...baseItem, id: 'c1', type: 'class', date: '2026-03-24', start_time: '10:00', end_time: '11:00', repeats_weekly: true };
    const shift: ShiftItem = { ...baseItem, id: 's1', type: 'shift', date: '2026-03-24', start_time: '10:30', end_time: '12:00', repeats_weekly: true };
    
    // Since repeats_weekly is true, it expands to 8 weeks of dates.
    // It should STILL only produce 1 conflict entry.
    const conflicts = calculateConflicts([valClass, shift]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].id).toBe('c1|s1');
  });

  it('matches point-in-time assignments within an interval', () => {
    const shift: ShiftItem = { ...baseItem, id: 's1', type: 'shift', date: '2026-03-24', start_time: '09:00', end_time: '17:00' };
    const assign: AssignmentItem = { ...baseItem, id: 'a1', type: 'assignment', due_date: '2026-03-24', due_time: '12:00' };
    
    const conflicts = calculateConflicts([shift, assign]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].severity).toBe('critical');
  });

  it('ignores self-conflicts', () => {
    const shift: ShiftItem = { ...baseItem, id: 's1', type: 'shift', date: '2026-03-24', start_time: '09:00', end_time: '17:00' };
    const conflicts = calculateConflicts([shift, shift]);
    expect(conflicts.length).toBe(0);
  });
});
