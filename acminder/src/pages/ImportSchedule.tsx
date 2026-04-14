import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-[100dvh] flex flex-col bg-appbg animate-fadeIn pb-20">
      <div className="max-w-[480px] mx-auto w-full px-5 pt-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center cursor-pointer active:scale-95 transition-all text-dark"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-h2 font-display text-dark">Import Calendar</span>
          <div className="w-9" />
        </div>

        <p className="text-body font-body text-secondary mb-8 leading-relaxed">
          Upload a <strong className="text-dark">.ics file</strong> from your Google or Apple calendar to sync your schedule instantly.
        </p>

        {/* Export Guide */}
        <div className="bg-peach rounded-card border border-peachborder p-4 mb-8">
          <div className="text-label font-bold text-peachtext uppercase tracking-widest mb-3">Quick Guide</div>
          <div className="space-y-3">
            {[
              { label: 'Google', desc: 'Settings → Export', icon: 'G' },
              { label: 'Apple', desc: 'File → Export', icon: 'A' },
              { label: 'Outlook', desc: 'Export → .ics', icon: 'O' }
            ].map(g => (
              <div key={g.label} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-badge bg-surface border border-peachborder/50 text-peachtext text-[10px] font-bold flex items-center justify-center uppercase tracking-widest">{g.icon}</div>
                <div className="text-caption text-secondary"><strong className="text-peachtext">{g.label}:</strong> {g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-card border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
            dragActive ? 'border-dark bg-surface scale-[1.01]' : file ? 'border-orange bg-surface focus:ring-4 ring-orange/10' : 'border-border bg-surface hover:border-dark'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".ics,text/calendar" onChange={(e) => setFile(e.target.files?.[0] || null)} className="sr-only" />

          {file ? (
            <div className="animate-fadeIn">
              <div className="w-12 h-12 rounded-badge bg-orange/10 flex items-center justify-center mx-auto mb-3">
                <FileUp size={24} className="text-orange" />
              </div>
              <p className="text-bodybold text-dark truncate px-4">{file.name}</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-caption text-orange font-bold hover:underline uppercase tracking-wider">Change File</button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <div className="w-12 h-12 rounded-badge bg-appbg flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-muted" />
              </div>
              <p className="text-bodybold text-dark">{dragActive ? 'Drop here' : 'Tap to Upload'}</p>
              <p className="text-caption text-muted mt-1 uppercase tracking-widest">Select .ics file</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleImport}
          disabled={importing || !file}
          className="w-full mt-6 bg-dark text-white py-4 rounded-btn font-display font-bold disabled:opacity-30 active:scale-[0.98] transition-all hover:opacity-90 uppercase tracking-widest"
        >
          {importing ? 'Syncing...' : 'Start Import'}
        </button>

        {/* Alerts & Results */}
        {(postImportConflicts > 0 || (importedCount !== null && importedCount > 0)) && (
          <div className="mt-8 space-y-4">
            {postImportConflicts > 0 && (
              <div className="bg-peach border border-peachborder rounded-card p-4 flex gap-4 animate-slideUp">
                <AlertTriangle size={20} className="text-orange shrink-0" />
                <div className="flex-1">
                  <div className="text-bodybold text-dark tracking-tight">{postImportConflicts} Conflicts Spotted</div>
                  <p className="text-caption text-secondary mt-1">Some events overlap with your current schedule.</p>
                  <button onClick={() => navigate('/home')} className="mt-4 w-full bg-dark text-white py-2.5 rounded-btn text-caption font-bold uppercase tracking-widest">Review Now</button>
                </div>
              </div>
            )}

            {importedCount !== null && importedCount > 0 && postImportConflicts === 0 && (
              <div className="bg-surface border border-border rounded-card p-4 flex gap-4 animate-slideUp">
                <CheckCircle2 size={20} className="text-dark shrink-0" />
                <div className="flex-1">
                  <div className="text-bodybold text-dark">{importedCount} Events Imported</div>
                  <p className="text-caption text-secondary mt-1">Your schedule is now up to date.</p>
                  <button onClick={() => navigate('/home')} className="mt-4 w-full bg-dark text-white py-2.5 rounded-btn text-caption font-bold uppercase tracking-widest">Done</button>
                </div>
              </div>
            )}
          </div>
        )}

        {importedCount === null && postImportConflicts === 0 && (
          <div className="mt-8 text-center px-4">
            <button
               onClick={() => navigate('/home')}
               className="text-caption text-muted font-bold hover:text-dark transition-colors uppercase tracking-widest"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
