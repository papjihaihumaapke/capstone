export type ScheduleItemType = 'shift' | 'class' | 'assignment';

export interface BaseScheduleItem {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
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
  completed?: boolean;
}

export type ScheduleItem = ShiftItem | ClassItem | AssignmentItem;

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
