import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, AlertTriangle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateConflictWithGemini, type GeminiConflictResult } from '../lib/gemini';
import { itemOccursOnDate, timeToMinutes } from '../lib/conflictEngine';

const AI_CACHE_PREFIX = 'acminder_ai_cache_';

function getCacheKey(conflictId: string) {
  return `${AI_CACHE_PREFIX}${conflictId}`;
}

function loadCachedAi(conflictId: string): { summary: string; suggestions: GeminiConflictResult['suggestions'] } | null {
  try {
    const raw = localStorage.getItem(getCacheKey(conflictId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.summary && Array.isArray(parsed?.suggestions)) return parsed;
  } catch { /* ignore */ }
  return null;
}

function saveCachedAi(conflictId: string, data: { summary: string; suggestions: GeminiConflictResult['suggestions'] }) {
  try {
    localStorage.setItem(getCacheKey(conflictId), JSON.stringify(data));
  } catch { /* ignore */ }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

export default function ConflictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { conflicts, resolveConflict, showToast, items } = ctx || {};

  const conflict = conflicts?.find((c) => c.id === id);
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

  useEffect(() => {
    if (id) {
      const cached = loadCachedAi(id);
      if (cached) {
        setAiSummary(cached.summary);
        setAiSuggestions(cached.suggestions);
      } else {
        fetchAi();
      }
    }
  }, [id]);

  const otherItemsSameDateInfo = useMemo(() => {
    if (!items || !itemA || !itemB || !conflictDate) {
      return { additionalConflictingItems: [] };
    }
    return {
      additionalConflictingItems: items.filter(it => it.id !== itemA.id && it.id !== itemB.id && itemOccursOnDate(it, conflictDate)),
    };
  }, [items, itemA, itemB, conflictDate]);

  const fetchAi = async () => {
    if (!conflict || !itemA || !itemB || !overlapWindow || !conflictDate) return;
    
    setAiLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      setAiSummary(isMinor ? 'Events are very close in time.' : 'Overlapping schedules detected.');
      setAiLoading(false);
      return;
    }

    try {
      const result = await generateConflictWithGemini({
        apiKey,
        item_a: itemA,
        item_b: itemB,
        conflict_date: conflictDate,
        overlap_window: overlapWindow,
        close_alternatives: [],
        additional_conflicts: otherItemsSameDateInfo.additionalConflictingItems,
      });
      setAiSummary(result.summary);
      setAiSuggestions(result.suggestions || []);
      if (id) saveCachedAi(id, { summary: result.summary, suggestions: result.suggestions || [] });
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to generate suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!conflict || !itemA || !itemB) return <div className="p-10 text-center text-sm text-textSecondary animate-pulse">Loading conflict data...</div>;

  const handleResolve = () => {
    resolveConflict?.(id!);
    showToast?.('Conflict marked as resolved');
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fadeIn">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-30">
        <div className="flex-1">
          <button 
            onClick={() => navigate(-1)} 
            className="-ml-2 w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all text-textPrimary" 
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
        <h1 className="flex-[3] text-center font-display font-bold text-base text-textPrimary">
          {isMinor ? 'Tight Schedule' : 'Conflict Resolution'}
        </h1>
        <div className="flex-1" />
      </header>

      <main className="flex-1 p-4 lg:p-10 max-w-2xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-[2rem] shadow-card border border-gray-100 p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${isMinor ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'} flex items-center justify-center`}>
                <AlertTriangle size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                {isMinor ? 'Caution: Tight Gap' : 'Critical: Overlap'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-textSecondary px-3 py-1 bg-surface rounded-full">{formatDate(conflictDate)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface rounded-2xl border border-gray-100">
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">First Item</span>
               <h3 className="text-sm font-bold text-textPrimary truncate mt-1">{itemA.title}</h3>
               <p className="text-xs text-textSecondary font-semibold mt-0.5">{formatTime12(itemA.start_time)} – {formatTime12(itemA.end_time)}</p>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-gray-100">
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Second Item</span>
               <h3 className="text-sm font-bold text-textPrimary truncate mt-1">{itemB.title}</h3>
               <p className="text-xs text-textSecondary font-semibold mt-0.5">{formatTime12(itemB.start_time)} – {formatTime12(itemB.end_time)}</p>
            </div>
          </div>

          {/* Overlap Duration */}
          {overlapWindow && (
            <div className={`rounded-2xl p-4 flex items-center gap-4 ${isMinor ? 'bg-warning/5 border border-warning/20' : 'bg-danger/5 border border-danger/20'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMinor ? 'bg-warning/10' : 'bg-danger/10'}`}>
                <span className={`text-base font-bold ${isMinor ? 'text-warning' : 'text-danger'}`}>⏱</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-textSecondary uppercase tracking-wider">Overlap Duration</p>
                <p className={`text-lg font-display font-bold ${isMinor ? 'text-warning' : 'text-danger'}`}>
                  {(() => {
                    const startMins = timeToMinutes(overlapWindow.start_time);
                    const endMins = timeToMinutes(overlapWindow.end_time);
                    const duration = Math.max(0, endMins - startMins);
                    if (duration === 0) return 'Exact overlap';
                    if (duration >= 60) {
                      const h = Math.floor(duration / 60);
                      const m = duration % 60;
                      return m > 0 ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`;
                    }
                    return `${duration} min`;
                  })()}
                </p>
                <p className="text-xs text-textSecondary mt-0.5">
                  {formatTime12(overlapWindow.start_time)} – {formatTime12(overlapWindow.end_time)}
                </p>
              </div>
            </div>
          )}
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-textSecondary">Smart Advice</h2>
            </div>
            <button 
              onClick={() => fetchAi()} 
              disabled={aiLoading}
              className="p-2 text-primary hover:bg-primary/5 rounded-full transition active:scale-90"
              title="Regenerate suggestions"
            >
              <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {!aiLoading ? (
            <div className="space-y-4">
              {aiSummary && (
                <div className="bg-indigo-50/50 rounded-3xl p-5 lg:p-6 border border-indigo-100/50">
                  <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">"{aiSummary}"</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                {aiSuggestions.map((s, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-textPrimary">
                          {s.proposed_start_time 
                            ? `Move ${s.move_item_type} to ${formatTime12(s.proposed_start_time)}` 
                            : `Adjust ${s.move_item_type || 'Schedule'}`}
                        </h4>
                        <p className="text-xs text-textSecondary mt-1 leading-relaxed">{s.reason}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleResolve}
                      className="w-full bg-white border border-primary/20 text-primary py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-border">
               <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles size={24} className="text-primary" />
               </div>
               <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">Consulting AI Advisor...</p>
            </div>
          )}
        </section>

        <div className="pt-6 space-y-4">
          <button
            onClick={handleResolve}
            className="w-full bg-primary text-white py-4 rounded-2xl font-display font-bold shadow-blue hover:bg-primaryDark transition active:scale-[0.98]"
          >
            Mark Overall Conflict Resolved
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full text-center text-xs font-bold text-textSecondary hover:underline py-2"
          >
            NOT NOW, DISMISS
          </button>
        </div>
      </main>
    </div>
  );
}
