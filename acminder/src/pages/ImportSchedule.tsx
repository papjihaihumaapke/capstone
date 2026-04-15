import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileUp, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { parseIcs, toDateString, toTimeString } from '../lib/ics';
import { addItems } from '../lib/supabase';
import { calculateConflicts } from '../lib/conflictEngine';

// ── localStorage helpers for ICS import history ───────────────
interface ImportSession {
  id: string;
  fileName: string;
  date: string;       // ISO date string
  itemIds: string[];
  count: number;
}

function getImportKey(userId: string) { return `acminder_ics_imports_${userId}`; }

function loadImportSessions(userId: string): ImportSession[] {
  try {
    const raw = localStorage.getItem(getImportKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveImportSessions(userId: string, sessions: ImportSession[]) {
  localStorage.setItem(getImportKey(userId), JSON.stringify(sessions));
}

export default function ImportSchedule() {
  const navigate = useNavigate();
  const { user, showToast, fetchItems, deleteItem } = useAppContext();
  const { signInWithGoogle } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [postImportConflicts, setPostImportConflicts] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [sessions, setSessions] = useState<ImportSession[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'import' | 'manage'>('import');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) setSessions(loadImportSessions(user.id));
  }, [user?.id]);

  const inferEventType = (summary: string): 'class' | 'shift' | 'assignment' => {
    const lower = summary.toLowerCase();
    if (/\b(class|lecture|lab|tutorial|seminar|course)\b/.test(lower)) return 'class';
    if (/\b(shift|work|job|store|warehouse)\b/.test(lower)) return 'shift';
    return 'assignment';
  };

  const handleImport = async () => {
    if (!user?.id) return;
    if (!file) { showToast?.('Please select a .ics file first.'); return; }
    setImporting(true);
    try {
      const text = await file.text();
      const events = parseIcs(text).filter(e => e.dtStart && e.dtEnd && e.summary);

      const items = events.map((e) => ({
        user_id: user.id,
        type: inferEventType(e.summary),
        title: e.summary,
        date: toDateString(e.dtStart!),
        start_time: toTimeString(e.dtStart!),
        end_time: toTimeString(e.dtEnd!),
        location: e.location || '',
        repeats_weekly: false,
      }));

      const existingItems = (await fetchItems?.()) || [];
      const newItems = items.filter(newItem =>
        !existingItems.some((existing: any) =>
          existing.title === newItem.title &&
          existing.date === newItem.date &&
          existing.start_time === newItem.start_time
        )
      );

      if (newItems.length > 0) {
        const inserted = await addItems(newItems as any);
        showToast?.(`Imported ${inserted.length} new events.`);
        setImportedCount(inserted.length);

        // Save import session to localStorage
        const session: ImportSession = {
          id: `ics_${Date.now()}`,
          fileName: file.name,
          date: new Date().toISOString(),
          itemIds: inserted.map((i: any) => i.id),
          count: inserted.length,
        };
        const updated = [session, ...loadImportSessions(user.id)];
        saveImportSessions(user.id, updated);
        setSessions(updated);
      } else {
        showToast?.('No new events detected.');
        setImportedCount(0);
      }

      await fetchItems?.();
      const latestItems = await fetchItems?.();
      if (latestItems && latestItems.length > 0) {
        const detected = calculateConflicts(latestItems);
        setPostImportConflicts(detected.length);
      }
    } catch (err: any) {
      showToast?.(err?.message || 'Failed to import calendar file.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteSession = async (session: ImportSession) => {
    if (!user?.id) return;
    if (!window.confirm(`Delete all ${session.count} items from "${session.fileName}"?`)) return;
    setDeletingId(session.id);
    try {
      await Promise.all(session.itemIds.map(id => deleteItem(id)));
      const updated = sessions.filter(s => s.id !== session.id);
      saveImportSessions(user.id, updated);
      setSessions(updated);
      showToast?.(`Deleted ${session.count} imported items.`);
      await fetchItems?.();
    } catch {
      showToast?.('Failed to delete some items.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-[100dvh] bg-appbg pb-24 lg:pb-10 animate-fadeIn">
      <div className="max-w-[640px] mx-auto px-4 lg:px-8 pt-6 lg:pt-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-8 h-8 rounded-[8px] bg-surface flex items-center justify-center hover:bg-appbg transition-colors shrink-0"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
          >
            <ArrowLeft size={16} className="text-dark" />
          </button>
          <h1 className="text-[20px] font-semibold text-dark">Import Calendar</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-surface rounded-[12px] p-1 mb-6"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.07)' }}>
          {(['import', 'manage'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-[8px] text-[13px] font-medium transition-colors capitalize ${
                tab === t ? 'bg-dark text-white' : 'text-muted hover:text-dark'
              }`}
            >
              {t === 'manage' ? `Manage Imports${sessions.length > 0 ? ` (${sessions.length})` : ''}` : 'Import .ics'}
            </button>
          ))}
        </div>

        {tab === 'import' && (
          <div className="space-y-4">
            {/* Google Calendar connect tile */}
            <div className="bento-tile">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">Sync Google Calendar</p>
              <p className="text-[13px] text-secondary mb-3 leading-relaxed">
                Connect your Google account to automatically sync your Google Calendar events into Acminder.
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#1A1A1A', color: '#FFFFFF' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".7"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".5"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".6"/>
                </svg>
                Connect Google Calendar
              </button>
            </div>

            {/* How to export .ics tile */}
            <div className="bento-tile">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">How to export a .ics file</p>
              <ol className="space-y-2 list-none">
                <li className="text-[13px] text-secondary leading-relaxed">
                  <strong className="text-dark font-medium">Google Calendar:</strong> Open Google Calendar on desktop → Settings (gear icon) → Import &amp; export → Export
                </li>
                <li className="text-[13px] text-secondary leading-relaxed" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                  <strong className="text-dark font-medium">Apple Calendar:</strong> Open Calendar on Mac → File menu → Export → Export…
                </li>
                <li className="text-[13px] text-secondary leading-relaxed" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                  <strong className="text-dark font-medium">Outlook:</strong> File → Open &amp; Export → Import/Export → Export to a file → iCalendar (.ics)
                </li>
              </ol>
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bento-tile cursor-pointer transition-all text-center ${
                dragActive
                  ? 'ring-2 ring-dark ring-offset-2'
                  : file
                  ? 'ring-2 ring-dark/30 ring-offset-1'
                  : 'hover:shadow-tile-hover'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".ics,text/calendar"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
              {file ? (
                <div className="animate-fadeIn">
                  <div className="w-10 h-10 rounded-[12px] bg-dark/8 flex items-center justify-center mx-auto mb-3">
                    <FileUp size={20} className="text-dark" />
                  </div>
                  <p className="text-[14px] font-medium text-dark truncate px-4">{file.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-2 text-[12px] text-muted font-medium hover:text-dark transition-colors"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="animate-fadeIn py-2">
                  <div className="w-10 h-10 rounded-[12px] bg-appbg flex items-center justify-center mx-auto mb-3">
                    <Upload size={20} className="text-muted" />
                  </div>
                  <p className="text-[14px] font-medium text-dark">
                    {dragActive ? 'Drop here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-[12px] text-muted mt-1">Supports .ics files</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !file}
              className="w-full bg-dark text-white py-3.5 rounded-[12px] text-[14px] font-medium disabled:opacity-30 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {importing ? 'Importing...' : 'Import Events'}
            </button>

            {/* Post-import results */}
            {postImportConflicts > 0 && (
              <div className="bento-tile flex gap-3 animate-slideUp">
                <AlertTriangle size={18} className="text-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium text-dark">{postImportConflicts} conflicts detected</p>
                  <p className="text-[12px] text-muted mt-0.5">Some imported events overlap with existing items.</p>
                  <button
                    onClick={() => navigate('/home')}
                    className="mt-3 bg-dark text-white rounded-[10px] px-4 py-2 text-[12px] font-medium hover:opacity-90 transition-opacity"
                  >
                    Review conflicts
                  </button>
                </div>
              </div>
            )}

            {importedCount !== null && importedCount > 0 && postImportConflicts === 0 && (
              <div className="bento-tile flex gap-3 animate-slideUp">
                <CheckCircle2 size={18} className="text-dark shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-medium text-dark">{importedCount} events imported</p>
                  <p className="text-[12px] text-muted mt-0.5">Your schedule is now up to date.</p>
                  <button
                    onClick={() => navigate('/home')}
                    className="mt-3 bg-dark text-white rounded-[10px] px-4 py-2 text-[12px] font-medium hover:opacity-90 transition-opacity"
                  >
                    Go to home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'manage' && (
          <div>
            {sessions.length === 0 ? (
              <div className="bento-tile flex flex-col items-center py-12 gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-appbg flex items-center justify-center">
                  <Upload size={18} className="text-muted" />
                </div>
                <p className="text-[14px] font-medium text-dark">No imports yet</p>
                <p className="text-[12px] text-muted text-center">
                  Import a .ics file and it will appear here so you can delete it later.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[12px] text-muted mb-1">
                  Each import below can be fully removed including all its events.
                </p>
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="bento-tile flex items-center gap-4"
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-appbg flex items-center justify-center shrink-0">
                      <FileUp size={16} className="text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-dark truncate">{session.fileName}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {session.count} events · {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session)}
                      disabled={deletingId === session.id}
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-muted hover:bg-orange/10 hover:text-orange transition-colors disabled:opacity-40 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skip link */}
        {tab === 'import' && importedCount === null && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/home')}
              className="text-[12px] text-muted hover:text-dark transition-colors font-medium"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
