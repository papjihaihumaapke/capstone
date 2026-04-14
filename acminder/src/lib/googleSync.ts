import type { ScheduleItem } from '../types';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
}

export function mapGoogleEventToItem(event: GoogleCalendarEvent, userId: string): Omit<ScheduleItem, 'id' | 'created_at'> {
  const start = event.start.dateTime || event.start.date || '';
  const end = event.end.dateTime || event.end.date || '';
  
  const startDate = start.split('T')[0];
  const startTime = start.includes('T') ? start.split('T')[1].substring(0, 5) : '09:00';
  const endTime = end.includes('T') ? end.split('T')[1].substring(0, 5) : '17:00';

  // Basic heuristic: if it has "Shift" or "Work" in title, it's a shift.
  // If it's during common class hours or has "Class", it's a class.
  const title = event.summary.toLowerCase();
  
  if (title.includes('shift') || title.includes('work') || title.includes('job')) {
    return {
      user_id: userId,
      type: 'shift',
      title: event.summary,
      date: startDate,
      start_time: startTime,
      end_time: endTime,
      location: event.location,
      repeats_weekly: false, // Google recurring events are handled as individual instances for now
    } as any;
  }

  return {
    user_id: userId,
    type: 'class',
    title: event.summary,
    date: startDate,
    start_time: startTime,
    end_time: endTime,
    location: event.location,
    repeats_weekly: false,
    course: event.summary,
  } as any;
}

export async function fetchGoogleEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days window

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Google Calendar events');
  }

  const data = await response.json();
  return data.items || [];
}
