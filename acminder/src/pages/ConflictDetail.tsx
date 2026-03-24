import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, AlertTriangle, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { generateConflictWithGemini, type GeminiConflictResult } from '../lib/gemini';
import { timeToMinutes } from '../lib/conflictEngine';
import type { ScheduleItem } from '../types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

function toHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime12(timeStr: string | undefined) {
  if (!timeStr) return '';
  // Strip seconds if present (HH:MM:SS → HH:MM)
  const t = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
  // If it's already in "h:mm AM/PM" form, keep it.
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

export default function ConflictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { conflicts, resolveConflict, showToast, items } = ctx || {};

  const conflict = conflicts?.find((c) => c.id === id);
  if (!conflict) return <div>Conflict not found</div>;

  const itemA = conflict.item_a;
  const itemB = conflict.item_b;

  const conflictDate = conflict.date || '';

  const overlapWindow = useMemo(() => {
    if (!conflict.overlap_start || !conflict.overlap_end) return null;
    return { start_time: conflict.overlap_start, end_time: conflict.overlap_end };
  }, [conflict]);

  const getIntervalForItem = (item: ScheduleItem) => {
    if (item.type === 'assignment') {
      const dueDate = item.due_date || item.date;
      const t = item.due_time || item.start_time;
      if (!dueDate || !t) return null;
      const start = timeToMinutes(t);
      return { date: dueDate, start, end: start + 1 }; // point-in-time represented as 1 minute
    }
    if (!item.start_time || !item.end_time || !item.date) return null;
    return { date: item.date, start: timeToMinutes(item.start_time), end: timeToMinutes(item.end_time) };
  };

  const isMinor = conflict.severity === 'minor';

  const subtitle =
    conflictDate && overlapWindow
      ? `${formatDate(conflictDate)} · ${formatTime12(overlapWindow.start_time)} – ${formatTime12(overlapWindow.end_time)}`
      : isMinor ? 'Events are scheduled too close to each other' : 'Conflict detected';

  const handleResolve = () => {
    resolveConflict && resolveConflict(id!);
    showToast && showToast('Conflict resolved!');
    navigate('/home');
  };

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<GeminiConflictResult['suggestions']>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const closeAlternatives = useMemo(() => {
    if (!items || !conflictDate || !overlapWindow) return [];

    // Students cannot reschedule university classes — only shifts and assignments are movable.
    const movable =
      itemA.type === 'shift'
        ? itemA
        : itemB.type === 'shift'
          ? itemB
          : itemA.type === 'assignment'
            ? itemA
            : itemB.type === 'assignment'
              ? itemB
              : null;

    if (!movable) return [];
    const movableInterval = getIntervalForItem(movable);
    if (!movableInterval) return [];

    const duration = movableInterval.end - movableInterval.start;
    if (duration <= 0) return [];

    const minBoundary = timeToMinutes('08:00');
    const maxBoundary = timeToMinutes('22:00');

    const offsets = [-180, -120, -90, -60, -45, -30, -15, 15, 30, 45, 60, 90, 120, 180];

    const otherItemsSameDate = (items || []).filter((it) => {
      const itDate = it.type === 'assignment' ? it.due_date || it.date : it.date;
      if (!itDate || itDate !== conflictDate) return false;
      return it.id !== itemA.id && it.id !== itemB.id;
    });

    const candidates: Array<{ start_time: string; end_time: string }> = [];
    for (const offset of offsets) {
      const start = movableInterval.start + offset;
      const end = start + duration;
      if (start < minBoundary || end > maxBoundary) continue;

      const candInterval = { start, end };
      const overlapsOther = otherItemsSameDate.some((it) => {
        const intv = getIntervalForItem(it);
        if (!intv) return false;
        return candInterval.start < intv.end && intv.start < candInterval.end;
      });
      if (overlapsOther) continue;

      candidates.push({ start_time: toHHMM(start), end_time: toHHMM(end) });
    }

    // Nearest first
    candidates.sort((x, y) => Math.abs(timeToMinutes(x.start_time) - movableInterval.start) - Math.abs(timeToMinutes(y.start_time) - movableInterval.start));
    const alternative_times = candidates.filter(
      (c, idx, self) => idx === self.findIndex((x) => x.start_time === c.start_time && x.end_time === c.end_time),
    ).slice(0, 3);

    if (!alternative_times.length) return [];
    return [
      {
        move_item_id: movable.id,
        move_item_type: movable.type,
        alternative_times,
      },
    ];
  }, [items, conflictDate, overlapWindow, itemA, itemB]);

  const conflictDateKey = conflictDate || '';
  const overlapWindowKey = overlapWindow ? `${overlapWindow.start_time}-${overlapWindow.end_time}` : '';
  const closeAlternativesKey = useMemo(() => JSON.stringify(closeAlternatives), [closeAlternatives]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setAiError(null);
      setAiSummary(null);
      setAiSuggestions([]);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        setAiSummary(isMinor 
          ? `This ${itemA.type} and ${itemB.type} are scheduled between ${formatTime12(overlapWindow?.start_time)} and ${formatTime12(overlapWindow?.end_time)}.`
          : `This ${itemA.type} and ${itemB.type} overlap between ${formatTime12(overlapWindow?.start_time)} and ${formatTime12(overlapWindow?.end_time)}.`);
        return;
      }
      if (!conflictDate || !overlapWindow) return;

      setAiLoading(true);
      try {
        const result = await generateConflictWithGemini({
          apiKey,
          item_a: itemA,
          item_b: itemB,
          conflict_date: conflictDate,
          overlap_window: overlapWindow,
          close_alternatives: closeAlternatives,
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
    return () => {
      cancelled = true;
    };
  }, [conflict.id, itemA.id, itemB.id, conflictDateKey, overlapWindowKey, closeAlternativesKey]);

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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
            <button
              onClick={() => navigate(`/item/${itemA.id}`)}
              className="absolute top-2 right-2 text-xs text-primary font-bold"
            >
              EDIT
            </button>
            <h3 className="font-semibold">{itemA.title}</h3>
            <p className="text-sm text-textSecondary">
              {itemA.type === 'assignment'
                ? `Due: ${formatTime12(itemA.due_time ?? itemA.start_time ?? '')}`
                : `${formatTime12(itemA.start_time)} - ${formatTime12(itemA.end_time)}`}
            </p>
            <p className="text-xs text-gray-400">{(itemA as any).location || (itemA.type === 'shift' ? (itemA as any).role : (itemA as any).course)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
            <button
              onClick={() => navigate(`/item/${itemB.id}`)}
              className="absolute top-2 right-2 text-xs text-primary font-bold"
            >
              EDIT
            </button>
            <h3 className="font-semibold">{itemB.title}</h3>
            <p className="text-sm text-textSecondary">
              {itemB.type === 'assignment'
                ? `Due: ${formatTime12(itemB.due_time ?? itemB.start_time ?? '')}`
                : `${formatTime12(itemB.start_time)} - ${formatTime12(itemB.end_time)}`}
            </p>
            <p className="text-xs text-gray-400">{(itemB as any).location || (itemB.type === 'shift' ? (itemB as any).role : (itemB as any).course)}</p>
          </div>
        </div>
      </section>

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
                    Nearby alternatives:{" "}
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
