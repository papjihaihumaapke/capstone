import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, FileUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState, useRef } from 'react';
import { parseIcs, toDateString, toTimeString } from '../lib/ics';
import { addItems } from '../lib/supabase';
import { calculateConflicts } from '../lib/conflictEngine';

export default function ImportSchedule() {
  const navigate = useNavigate();
  const { user, showToast, fetchItems } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [postImportConflicts, setPostImportConflicts] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inferEventType = (summary: string): 'class' | 'shift' | 'assignment' => {
    const lower = summary.toLowerCase();
    if (/\b(class|lecture|lab|tutorial|seminar|course)\b/.test(lower)) return 'class';
    if (/\b(shift|work|job|store|warehouse)\b/.test(lower)) return 'shift';
    return 'assignment';
  };

  const handleImport = async () => {
    if (!user?.id) return;
    if (!file) {
      showToast?.('Please select a .ics file first.');
      return;
    }
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

      // Deduplicate against existing items
      const existingItems = (await fetchItems?.()) || [];
      const newItems = items.filter(newItem => {
        return !existingItems.some((existing: any) =>
          existing.title === newItem.title &&
          existing.date === newItem.date &&
          existing.start_time === newItem.start_time
        );
      });

      if (newItems.length > 0) {
        const inserted = await addItems(newItems as any);
        showToast?.(`Imported ${inserted.length} new events.`);
        setImportedCount(inserted.length);
      } else {
        showToast?.('No new events to import — all events already exist.');
        setImportedCount(0);
      }

      await fetchItems?.();

      // Check for conflicts
      const latestItems = await fetchItems?.();
      if (latestItems && latestItems.length > 0) {
        const detected = calculateConflicts(latestItems);
        setPostImportConflicts(detected.length);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to import calendar file.';
      showToast?.(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="max-w-lg lg:max-w-xl mx-auto w-full flex flex-col flex-1 px-4 lg:px-0">
        {/* Header */}
        <div className="pt-10 pb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-textSecondary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-semibold text-textPrimary">
            Import <span className="text-primary">Calendar</span>
          </h1>
        </div>

        <main className="flex-1 pb-8">
          <p className="text-sm font-body text-textSecondary mb-6 leading-relaxed">
            Upload a <strong className="text-textPrimary">.ics file</strong> exported from Google Calendar, Apple Calendar, or your school/work system. Events will be automatically categorized as classes, shifts, or tasks.
          </p>

          {/* How to export guide */}
          <div className="bg-primaryLight rounded-2xl p-4 mb-6 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-2">How to export your calendar:</p>
            <ul className="text-xs text-textSecondary space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">G</span>
                <span><strong className="text-textPrimary">Google:</strong> Settings → Import & Export → Export</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-textPrimary text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">A</span>
                <span><strong className="text-textPrimary">Apple:</strong> File → Export → Export…</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">O</span>
                <span><strong className="text-textPrimary">Outlook:</strong> File → Open & Export → Import/Export</span>
              </li>
            </ul>
          </div>

          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary bg-primaryLight scale-[1.01]'
                : file
                ? 'border-success bg-green-50'
                : 'border-border bg-white hover:border-primary/40 hover:bg-primaryLight/30'
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
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <FileUp size={24} className="text-success" />
                </div>
                <p className="text-sm font-semibold text-textPrimary">{file.name}</p>
                <p className="text-xs text-textSecondary mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-danger font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-3">
                  <Upload size={24} className="text-textSecondary" />
                </div>
                <p className="text-sm font-semibold text-textPrimary">
                  {dragActive ? 'Drop your file here' : 'Choose a .ics file'}
                </p>
                <p className="text-xs text-textSecondary mt-1">or drag and drop it here</p>
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !file}
            className="w-full mt-5 bg-primary text-white py-3.5 rounded-2xl font-display font-semibold disabled:opacity-40 active:scale-[0.98] transition-all shadow-blue hover:bg-primaryDark"
          >
            {importing ? 'Importing…' : 'Import Calendar'}
          </button>

          {/* Post-import conflict alert */}
          {postImportConflicts > 0 && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-red-700">
                  {postImportConflicts} conflict{postImportConflicts > 1 ? 's' : ''} detected
                </div>
                <p className="text-xs text-red-600 mt-1">Imported events overlap with existing schedule items.</p>
                <button
                  type="button"
                  onClick={() => navigate('/home?tab=suggestions')}
                  className="mt-3 w-full bg-red-500 text-white py-2.5 rounded-full text-sm font-semibold active:scale-95 transition"
                >
                  Review Conflicts
                </button>
              </div>
            </div>
          )}

          {/* Success state */}
          {importedCount !== null && importedCount > 0 && postImportConflicts === 0 && (
            <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 size={20} className="text-success mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-green-700">
                  {importedCount} events imported successfully!
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="mt-3 w-full bg-success text-white py-2.5 rounded-full text-sm font-semibold active:scale-95 transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Post-import actions */}
          {(importedCount !== null || postImportConflicts > 0) && (
            <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4 animate-fadeIn">
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-primary text-white py-4 rounded-2xl font-display font-bold shadow-blue hover:bg-primaryDark active:scale-[0.98] transition-all"
              >
                Finish & Go to Dashboard
              </button>
              <button
                onClick={() => { setFile(null); setImportedCount(null); setPostImportConflicts(0); }}
                className="w-full py-3 text-sm text-textSecondary font-semibold hover:text-primary transition-colors"
              >
                Import another file
              </button>
            </div>
          )}

          {/* Skip link (only if not imported yet) */}
          {importedCount === null && postImportConflicts === 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/home')}
                className="text-sm text-primary font-medium hover:underline transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
