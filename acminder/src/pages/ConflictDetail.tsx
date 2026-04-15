import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { usePreferences } from '../hooks/usePreferences';
import { ArrowLeft, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
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

function formatTimeOnly(t: string | undefined) {
  if (!t) return '';
  const match = t.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const h = Number(match[1]);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${ampm}`;
}

export default function ConflictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { conflicts, resolveConflict, showToast, items } = ctx || {};
  const { prefs } = usePreferences();

  const conflict = conflicts?.find((c) => c.id === id);
  const itemA = conflict?.item_a ?? null;
  const itemB = conflict?.item_b ?? null;
  const conflictDate = conflict?.date || '';

  const overlapWindow = useMemo(() => {
    if (!conflict?.overlap_start || !conflict?.overlap_end) return null;
    return { start_time: conflict.overlap_start, end_time: conflict.overlap_end };
  }, [conflict?.overlap_start, conflict?.overlap_end]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<GeminiConflictResult['suggestions']>([]);

  useEffect(() => {
    if (!id || !prefs.smartSuggestions) return;
    const cached = loadCachedAi(id);
    if (cached) {
      setAiSummary(cached.summary);
      setAiSuggestions(cached.suggestions);
    } else {
      fetchAi();
    }
  }, [id, prefs.smartSuggestions]);

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
      setAiSummary('Events are conflicting.');
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

  if (!conflict || !itemA || !itemB) return <div className="p-10 text-center text-sm text-secondary animate-pulse">Loading conflict data...</div>;

  const handleResolve = () => {
    resolveConflict?.(id!);
    showToast?.('Conflict marked as resolved');
    navigate('/home');
  };

  return (
    <div className="min-h-[100dvh] bg-appbg animate-fadeIn pb-24 lg:pb-10">
      <div className="max-w-[640px] mx-auto px-5 lg:px-8 pt-8 lg:pt-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center cursor-pointer active:scale-95 transition-all text-dark"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-h2 font-display text-dark">Conflict Details</span>
          <div className="w-9" />
        </div>

        {/* Hero Card */}
        <div className="bg-peach rounded-card border border-peachborder p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-badge bg-orange flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                 </div>
                 <span className="text-caption font-bold text-orange uppercase tracking-wider">
                   {conflict.severity === 'minor' ? 'Tight Gap' : 'Overlap'}
                 </span>
             </div>
             <span className="text-caption font-bold text-peachtext">{formatDate(conflictDate)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface rounded-card p-3 border border-peachborder/50">
               <div className="text-[10px] text-muted font-bold tracking-wider uppercase">Item 1</div>
               <div className="text-bodybold text-dark mt-1 truncate">{itemA.title}</div>
               <div className="text-caption text-secondary mt-0.5">{formatTimeOnly(itemA.start_time)} – {formatTimeOnly(itemA.end_time)}</div>
            </div>
            <div className="bg-surface rounded-card p-3 border border-peachborder/50">
               <div className="text-[10px] text-muted font-bold tracking-wider uppercase">Item 2</div>
               <div className="text-bodybold text-dark mt-1 truncate">{itemB.title}</div>
               <div className="text-caption text-secondary mt-0.5">{formatTimeOnly(itemB.start_time)} – {formatTimeOnly(itemB.end_time)}</div>
            </div>
          </div>

          {overlapWindow && (
            <div className="bg-surface/50 rounded-card p-3 flex items-center justify-between border border-peachborder/50">
              <span className="text-caption font-bold text-orange uppercase tracking-wider">Overlap Duration</span>
              <span className="text-bodybold text-orange">
                {(() => {
                  const startMins = timeToMinutes(overlapWindow.start_time);
                  const endMins = timeToMinutes(overlapWindow.end_time);
                  const duration = Math.max(0, endMins - startMins);
                  if (duration === 0) return 'Exact';
                  if (duration >= 60) return `${Math.floor(duration / 60)}h ${duration % 60}m`;
                  return `${duration} mins`;
                })()}
              </span>
            </div>
          )}
        </div>

        {/* AI Insight Section — only shown when Smart Suggestions is enabled in Settings */}
        {prefs.smartSuggestions && (
          <>
            <div className="mt-8 mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-dark" />
                <h2 className="text-label font-bold uppercase tracking-widest text-muted">Smart Advice</h2>
              </div>
              <button
                onClick={() => fetchAi()}
                disabled={aiLoading}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface active:scale-95 transition-all text-dark bg-transparent"
              >
                <RefreshCw size={14} className={aiLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {!aiLoading ? (
              <div className="flex flex-col gap-3">
                {aiSummary && (
                  <div className="bg-surface rounded-card border border-border p-4">
                    <p className="text-body font-medium text-dark leading-relaxed italic">"{aiSummary}"</p>
                  </div>
                )}

                {aiSuggestions.map((s, idx) => (
                  <div key={idx} className="bg-surface rounded-card border border-border p-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-badge bg-appbg flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-dark" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-bodybold text-dark">
                          {s.proposed_start_time
                            ? `Move ${s.move_item_type} to ${formatTimeOnly(s.proposed_start_time)}`
                            : `Adjust ${s.move_item_type || 'Schedule'}`}
                        </div>
                        <p className="text-caption text-muted mt-1 leading-relaxed">{s.reason}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed px-1">
                      This is a suggestion only — you'll need to update your schedule manually if you want to follow it.
                    </p>
                    <button
                      onClick={handleResolve}
                      className="w-full bg-dark text-white py-2.5 rounded-btn text-caption font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-card border border-border p-10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-appbg rounded-[18px] flex items-center justify-center animate-bounce text-dark">
                  <Sparkles size={24} />
                </div>
                <p className="text-label font-bold text-muted uppercase tracking-widest">Consulting AI Advisor...</p>
              </div>
            )}
          </>
        )}

        {/* Global CTA */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleResolve}
            className="w-full bg-dark text-white py-4 rounded-btn font-display font-bold shadow-none hover:opacity-90 transition active:scale-[0.98]"
          >
            Mark Conflict Resolved
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full text-center text-caption font-bold text-muted hover:text-dark py-2 transition-colors uppercase tracking-wider"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
