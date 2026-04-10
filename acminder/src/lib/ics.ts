type IcsEvent = { summary: string; location?: string; dtStart?: Date; dtEnd?: Date; isAllDay?: boolean };

function parseIcsDate(raw: string): Date | undefined {
  // Supports:
  // - YYYYMMDD
  // - YYYYMMDDTHHmmssZ
  // - YYYYMMDDTHHmmss
  const v = raw.trim();
  const mDateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (mDateOnly) {
     // For all-day events, treat as UTC midnight to avoid local timezone shifts during parsing
     return new Date(Date.UTC(Number(mDateOnly[1]), Number(mDateOnly[2]) - 1, Number(mDateOnly[3])));
  }

  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(v);
  if (!m) return undefined;
  const [, y, mo, d, hh, mm, ss = '00', z] = m;
  const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}${z ? 'Z' : ''}`;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

/**
 * Extracts the value from an iCal line, handling parameters like ;VALUE=DATE or ;TZID=...
 */
function getIcalValue(line: string): string {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return '';
  return line.slice(colonIdx + 1).trim();
}

/**
 * Robust iCalendar parser that handles folded lines, parameters, and all-day events.
 */
export function parseIcs(text: string): IcsEvent[] {
  // Fold lines: iCal spec says long lines are split by CRLF + (space or tab)
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);
  
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;
  let durationMins = 0;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('BEGIN:VEVENT')) {
      current = { summary: '' };
      durationMins = 0;
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (current) {
        if (current.dtStart && !current.dtEnd && durationMins > 0) {
          current.dtEnd = new Date(current.dtStart.getTime() + durationMins * 60000);
        }
        // If it's an all-day event (no DTEND provided), default to 1 day
        if (current.dtStart && !current.dtEnd) {
          current.dtEnd = new Date(current.dtStart.getTime() + 24 * 60 * 60 * 1000);
          current.isAllDay = true;
        }
        if (current.summary || current.dtStart) events.push(current);
      }
      current = null;
      continue;
    }

    if (!current) continue;

    // Handle properties with potential parameters (e.g., SUMMARY;LANGUAGE=en-us:Title)
    const [propNamePart] = line.split(/[:;]/);
    const val = getIcalValue(line);

    switch (propNamePart) {
      case 'SUMMARY':
        current.summary = val;
        break;
      case 'LOCATION':
        current.location = val;
        break;
      case 'DTSTART':
        current.dtStart = parseIcsDate(val);
        if (line.includes('VALUE=DATE') && !line.includes('T')) current.isAllDay = true;
        break;
      case 'DTEND':
        current.dtEnd = parseIcsDate(val);
        break;
      case 'DURATION':
        const hMatch = val.match(/(\d+)H/);
        const mMatch = val.match(/(\d+)M/);
        durationMins = (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
        if (durationMins === 0 && val.includes('PT')) durationMins = 60; // Default 1hr if PT exists but unparseable
        break;
    }
  }
  return events;
}

/**
 * Converts a Date object to a safe local YYYY-MM-DD string,
 * taking care to use the correct timezone-agnostic components for all-day events.
 */
export function toDateString(d: Date, isAllDay = false): string {
  if (isAllDay) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts a Date object to a 24h HH:mm string.
 */
export function toTimeString(d: Date, isAllDay = false): string {
  if (isAllDay) return '09:00'; // Default start for all-day imports
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
