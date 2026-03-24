import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, AlertTriangle, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { generateConflictWithGemini, type GeminiConflictResult } from '../lib/gemini';
import { timeToMinutes, itemOccursOnDate } from '../lib/conflictEngine';
import type { ScheduleItem } from '../types';

function formatDate(dateStr: string) {
  // Append T00:00:00 to avoid UTC midnight → previous-day timezone shift
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

function toHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime12(timeStr: string | undefined) {
  if (!timeStr) return '';
  const t = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
  if (/[AaPp][Mm]$/.test(t)) return t;
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return t;
  const h24 = Number(match[1]);
  const mins = match[2];
  if (Number.isNaN(h24)) return t;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins} ${ampm}`;
}

function getItemInterval(item: ScheduleItem) {
  if (item.type === 'assignment') {
    const dueDate = item.due_date || item.date;
    const t = item.due_time || item.start_time;
    if (!dueDate || !t) return null;
    const start = timeToMinutes(t);
    return { date: dueDate, start, end: start + 1 };
  }
  if (!item.start_time || !item.end_time || !item.date) return null;
  return { date: item.date, start: timeToMinutes(item.start_time), end: timeToMinutes(item.end_time) };
}

function getItemSubtitle(item: any) {
  if (item.type === 'shift') {
    return [item.role, item.location].filter(Boolean).join(' • ');
  }
  if (item.type === 'class') {
    return [item.course, item.location].filter(Boolean).join(' • ');
  }
  if (item.type === 'assignment') {
    return item.course || '';
  }
  return item.location || '';
}

export default function ConflictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { conflicts, resolveConflict, showToast, items } = ctx || {};

  const conflict = conflicts?.find((c) => c.id === id);

  // ── All hooks must be called unconditionally before any early return ──
  const itemA = conflict?.item_a ?? null;
  const itemB = conflict?.item_b ?? null;
  const conflictDate = conflict?.date || '';

  const overlapWindow = useMemo(() => {
    if (!conflict?.overlap_start || !conflict?.overlap_end) return null;
    return { start_time: conflict.overlap_start, end_time: conflict.overlap_end };
  }, [conflict?.overlap_start, conflict?.overlap_end]);

  const isMinor = conflict?.severity === 'minor';

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<GeminiConflictResult['suggestions']>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const otherItemsSameDateInfo = useMemo(() => {
    if (!items || !itemA || !itemB || !conflictDate) {
      return { additionalConflictingItems: [], nonConflictingItemsToday: [] };
    }

    const otherItemsSameDate = items.filter((it) => {
      if (!itemOccursOnDate(it, conflictDate)) return false;
      return it.id !== itemA.id && it.id !== itemB.id;
    }).sort((a, b) => {
      const timeA = a.type === 'assignment' ? (a.due_time || a.start_time || '') : a.start_time;
      const timeB = b.type === 'assignment' ? (b.due_time || b.start_time || '') : b.start_time;
      return timeA.localeCompare(timeB);
    });

    const additionalConflictingItems = otherItemsSameDate.filter((it) => {
      const itv = getItemInterval(it);
      const aItv = getItemInterval(itemA);
      const bItv = getItemInterval(itemB);
      if (!itv) return false;
      
      const overlapsA = aItv && itv.start < aItv.end && aItv.start < itv.end;
      const overlapsB = bItv && itv.start < bItv.end && bItv.start < itv.end;
      return overlapsA || overlapsB;
    });

    const nonConflictingItemsToday = otherItemsSameDate.filter(it => !additionalConflictingItems.includes(it));

    return { additionalConflictingItems, nonConflictingItemsToday };
  }, [items, itemA, itemB, conflictDate]);

  const closeAlternatives = useMemo(() => {
    if (!conflict || !items || !conflictDate || !overlapWindow || !itemA || !itemB) return [];

    const movable =
      itemA.type === 'shift' ? itemA
        : itemB.type === 'shift' ? itemB
          : itemA.type === 'assignment' ? itemA
            : itemB.type === 'assignment' ? itemB
              : null;

    if (!movable) return [];
    const movableInterval = getItemInterval(movable);
    if (!movableInterval) return [];

    const duration = movableInterval.end - movableInterval.start;
    if (duration <= 0) return [];

    const minBoundary = timeToMinutes('08:00');
    const maxBoundary = timeToMinutes('22:00');
    const offsets = [-180, -120, -90, -60, -45, -30, -15, 15, 30, 45, 60, 90, 120, 180];

    const otherItemsSameDate = [
      ...otherItemsSameDateInfo.additionalConflictingItems,
      ...otherItemsSameDateInfo.nonConflictingItemsToday
    ];

    const candidates: Array<{ start_time: string; end_time: string }> = [];
    for (const offset of offsets) {
      const start = movableInterval.start + offset;
      const end = start + duration;
      if (start < minBoundary || end > maxBoundary) continue;

      const candInterval = { start, end };
      const overlapsOther = otherItemsSameDate.some((it) => {
        const intv = getItemInterval(it);
        if (!intv) return false;
        return candInterval.start < intv.end && intv.start < candInterval.end;
      });
      if (overlapsOther) continue;
      candidates.push({ start_time: toHHMM(start), end_time: toHHMM(end) });
    }

    candidates.sort(
      (x, y) =>
        Math.abs(timeToMinutes(x.start_time) - movableInterval.start) -
        Math.abs(timeToMinutes(y.start_time) - movableInterval.start),
    );
    const alternative_times = candidates
      .filter((c, idx, self) => idx === self.findIndex((x) => x.start_time === c.start_time && x.end_time === c.end_time))
      .slice(0, 3);

    if (!alternative_times.length) return [];
    return [{ move_item_id: movable.id, move_item_type: movable.type, alternative_times }];
  }, [conflict, conflictDate, overlapWindow, itemA, itemB, otherItemsSameDateInfo]);

  const conflictDateKey = conflictDate;
  const overlapWindowKey = overlapWindow ? `${overlapWindow.start_time}-${overlapWindow.end_time}` : '';
  const closeAlternativesKey = useMemo(() => JSON.stringify(closeAlternatives), [closeAlternatives]);

  useEffect(() => {
    if (!conflict || !conflictDate || !overlapWindow || !itemA || !itemB) return;

    let cancelled = false;

    const run = async () => {
      setAiError(null);
      setAiSummary(null);
      setAiSuggestions([]);

      // Respect the Smart Suggestions preference
      const storedPrefs = localStorage.getItem('acminder_prefs');
      const smartSuggestions = storedPrefs ? JSON.parse(storedPrefs).smartSuggestions !== false : true;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey || !smartSuggestions) {
        setAiSummary(
          isMinor
            ? `This ${itemA.type} and ${itemB.type} are scheduled very close to each other.`
            : `This ${itemA.type} and ${itemB.type} overlap between ${formatTime12(overlapWindow.start_time)} and ${formatTime12(overlapWindow.end_time)}.`,
        );
        return;
      }

      setAiLoading(true);
      try {
        const result = await generateConflictWithGemini({
          apiKey,
          item_a: itemA,
          item_b: itemB,
          conflict_date: conflictDate,
          overlap_window: overlapWindow,
          close_alternatives: closeAlternatives,
          additional_conflicts: otherItemsSameDateInfo?.additionalConflictingItems || [],
        });
        if (cancelled) return;
        setAiSummary(result.summary);
        setAiSuggestions(result.suggestions || []);
      } catch (e: any) {
        if (cancelled) return;
        setAiError(e?.message || 'Failed to generate AI suggestions.');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [conflict?.id, itemA?.id, itemB?.id, conflictDateKey, overlapWindowKey, closeAlternativesKey]);

  // ── Early return is safe here — all hooks have already been called ──
  if (!conflict || !itemA || !itemB) {
    return <div className="p-6 text-sm text-textSecondary">Conflict not found.</div>;
  }

  const subtitle =
    conflictDate && overlapWindow
      ? (() => {
          let minStart = timeToMinutes(overlapWindow.start_time);
          let maxEnd = timeToMinutes(overlapWindow.end_time);

          if (otherItemsSameDateInfo?.additionalConflictingItems?.length) {
             const all = [itemA, itemB, ...otherItemsSameDateInfo.additionalConflictingItems];
             for (const it of all) {
                const intv = getItemInterval(it);
                if (intv) {
                   if (intv.start < minStart) minStart = intv.start;
                   if (intv.end > maxEnd) maxEnd = intv.end;
                }
             }
          }
          return `${formatDate(conflictDate)} · ${formatTime12(toHHMM(minStart))} – ${formatTime12(toHHMM(maxEnd))}`;
        })()
      : isMinor
        ? 'Events are scheduled too close to each other'
        : 'Conflict detected';

  const handleResolve = () => {
    resolveConflict && resolveConflict(id!);
    showToast && showToast('Conflict resolved!');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background p-4 animate-fadeIn">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/home')} className="mr-4" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <AlertTriangle size={24} className={`${isMinor ? 'text-orange-500' : 'text-primary'} mr-2`} />
        <h1 className="text-xl font-display font-bold">{isMinor ? 'Tight Schedule' : 'Schedule Conflict'}</h1>
      </header>

      <p className="text-sm text-textSecondary mb-6">{subtitle}</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Conflicting Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[itemA, itemB, ...(otherItemsSameDateInfo?.additionalConflictingItems || [])].map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-red-100 relative">
              <button
                onClick={() => navigate(`/item/${item.id}`)}
                className="absolute top-2 right-2 text-xs text-primary font-bold hover:underline"
              >
                EDIT
              </button>
              <h3 className="font-semibold text-red-900">{item.title}</h3>
              <p className="text-sm text-red-700/80">
                {item.type === 'assignment'
                  ? `Due: ${formatTime12(item.due_time ?? item.start_time ?? '')}`
                  : `${formatTime12(item.start_time)} - ${formatTime12(item.end_time)}`}
              </p>
              <p className="text-xs text-red-700/60 mt-1 font-medium">
                {getItemSubtitle(item)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {(otherItemsSameDateInfo?.nonConflictingItemsToday?.length || 0) > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-textSecondary">Also on this day</h2>
          <div className="flex flex-col gap-3">
            {otherItemsSameDateInfo?.nonConflictingItemsToday?.map((item) => (
              <div key={item.id} className="bg-white/60 rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-textSecondary mt-1">
                    {getItemSubtitle(item)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="text-xs font-semibold text-gray-400 hover:text-primary transition"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Conflict Summary & AI Suggestions</h2>

        {aiLoading && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm text-textSecondary">
            Generating suggestions…
          </div>
        )}

        {!aiLoading && aiSummary && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
            <div className="flex items-start gap-3">
              <Sparkles size={22} className="text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Summary</h3>
                <p className="text-sm text-textSecondary">{aiSummary}</p>
              </div>
            </div>
          </div>
        )}

        {!!aiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4">
            {aiError}
          </div>
        )}

        <div className="space-y-4">
          {aiSuggestions.length === 0 && !aiLoading ? (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <Calendar size={24} className="text-primary mt-1" />
              <div>
                <h3 className="font-semibold">
                  {!import.meta.env.VITE_GEMINI_API_KEY ? 'Suggestions unavailable' : 'No suggestions found'}
                </h3>
                <p className="text-sm text-textSecondary">
                  {!import.meta.env.VITE_GEMINI_API_KEY
                    ? 'Add `VITE_GEMINI_API_KEY` to enable Gemini conflict suggestions.'
                    : 'The AI could not find any available alternative time slots for this conflict.'}
                </p>
              </div>
            </div>
          ) : null}

          {aiSuggestions.map((s, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <CheckCircle size={24} className="text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {s.proposed_start_time && s.proposed_end_time
                    ? `Move ${s.move_item_type} to ${formatTime12(s.proposed_start_time)} - ${formatTime12(s.proposed_end_time)}`
                    : s.move_item_type && s.move_item_type !== 'none'
                      ? `Adjust ${s.move_item_type}`
                      : 'Recommendation'}
                </h3>
                <p className="text-sm text-textSecondary mt-1">{s.reason}</p>
                {s.alternative_times?.length ? (
                  <div className="mt-3 text-xs text-gray-500">
                    Nearby alternatives:{' '}
                    {s.alternative_times
                      .map((t) => `${formatTime12(t.start_time)}-${formatTime12(t.end_time)}`)
                      .slice(0, 3)
                      .join(', ')}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleResolve}
        className="w-full bg-[#F07B5A] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#e06a49] active:scale-95 transition-colors mb-4"
      >
        Conflict Resolved
      </button>

      <button
        onClick={() => navigate('/home')}
        className="w-full text-center text-sm text-primary"
      >
        Back to Schedule
      </button>
    </div>
  );
}
