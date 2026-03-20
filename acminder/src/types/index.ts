export type ScheduleItemType = 'shift' | 'class' | 'assignment';

export interface ScheduleItem {
  id: string;
  user_id: string;
  type: ScheduleItemType;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  role?: string;
  repeats_weekly?: boolean;
  due_date?: string;
  due_time?: string;
  course?: string;
  created_at?: string;
}

export interface Conflict {
  id: string;
  item_a: ScheduleItem;
  item_b: ScheduleItem;
  resolved: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
