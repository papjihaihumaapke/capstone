export type ScheduleItemType = 'shift' | 'class' | 'assignment' | 'routine';

export interface BaseScheduleItem {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
  completed?: boolean;
}

export interface ShiftItem extends BaseScheduleItem {
  type: 'shift';
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  role?: string;
  repeats_weekly?: boolean;
}

export interface ClassItem extends BaseScheduleItem {
  type: 'class';
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  course?: string;
  repeats_weekly?: boolean;
}

export interface AssignmentItem extends BaseScheduleItem {
  type: 'assignment';
  due_date?: string; // Kept optional for backward compatibility in DB temporarily, but validated by engine
  due_time?: string;
  date?: string; // Legacy fallback
  start_time?: string; // Legacy fallback
  end_time?: string; // Legacy fallback
  course?: string;
}

export interface RoutineItem extends BaseScheduleItem {
  type: 'routine';
  date: string; // The date it was first added or just a baseline date
  start_time: string;
  end_time: string;
  repeats_weekly: boolean;
  category?: 'sleep' | 'gym' | 'meal' | 'study' | 'other';
}

export type ScheduleItem = ShiftItem | ClassItem | AssignmentItem | RoutineItem;

export interface Conflict {
  id: string;
  item_a: ScheduleItem;
  item_b: ScheduleItem;
  resolved: boolean;
  severity?: 'critical' | 'minor';
  date?: string; // The exact date YYYY-MM-DD the collision occurred
  overlap_start?: string; // HH:MM
  overlap_end?: string; // HH:MM
}

export interface User {
  id: string;
  email: string;
  name: string;
}
