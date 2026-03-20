type IcsEvent = { summary: string; location?: string; dtStart?: Date; dtEnd?: Date };

function parseIcsDate(raw: string): Date | undefined {
  // Supports:
  // - YYYYMMDD
  // - YYYYMMDDTHHmmssZ
  // - YYYYMMDDTHHmmss
  // - YYYYMMDDTHHmmZ / YYYYMMDDTHHmm
  const v = raw.trim();
  const mDateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (mDateOnly) return new Date(`${mDateOnly[1]}-${mDateOnly[2]}-${mDateOnly[3]}T00:00:00`);

  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(v);
  if (!m) return undefined;
  const [, y, mo, d, hh, mm, ss = '00', z] = m;
  const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}${z ? 'Z' : ''}`;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function getLineValue(line: string): string {
  const idx = line.indexOf(':');
  return idx >= 0 ? line.slice(idx + 1).trim() : '';
}

export function parseIcs(text: string): IcsEvent[] {
  const unfolded = text.replace(/\r\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = { summary: '' };
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.summary) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    if (line.startsWith('SUMMARY')) current.summary = getLineValue(line);
    if (line.startsWith('LOCATION')) current.location = getLineValue(line);
    if (line.startsWith('DTSTART')) current.dtStart = parseIcsDate(getLineValue(line));
    if (line.startsWith('DTEND')) current.dtEnd = parseIcsDate(getLineValue(line));
  }
  return events;
}

export function toDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toTimeString(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

