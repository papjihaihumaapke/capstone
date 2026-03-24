import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Briefcase, CalendarDays, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';
import { parseIcs, toDateString, toTimeString } from '../lib/ics';
import { addItems } from '../lib/supabase';

const SOURCES = [
  { id: 'college', title: 'College Timetable', desc: 'Import your class calendar', icon: CalendarIcon, color: 'bg-blue-50 text-blue-600', comingSoon: false },
  { id: 'work', title: 'Work Shift Schedule', desc: 'Sync your work shifts', icon: Briefcase, color: 'bg-green-50 text-green-600', comingSoon: false },
  { id: 'external', title: 'Google/Apple Calendar', desc: 'Connect external calendars', icon: CalendarDays, color: 'bg-orange-50 text-orange-600', comingSoon: true }
];

export default function ImportSchedule() {
  const navigate = useNavigate();
  const { importedSources, setImportedSources, user, showToast, fetchItems } = useAppContext();
  const [collegeFile, setCollegeFile] = useState<File | null>(null);
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);

  useEffect(() => {
    if (importCount > 0 && importCount >= importedSources.size) {
      navigate('/home');
    }
  }, [importCount, importedSources.size, navigate]);

  const toggleSource = (id: string) => {
    const source = SOURCES.find(s => s.id === id);
    if (source?.comingSoon) return;
    setImportedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const importCollegeIcs = async () => {
    if (!user?.id) return;
    if (!collegeFile) {
      showToast?.('Upload a .ics file to import.');
      return;
    }
    setImporting(true);
    try {
      const text = await collegeFile.text();
      const events = parseIcs(text).filter(e => e.dtStart && e.dtEnd && e.summary);
      const items = events.map((e) => ({
        user_id: user.id,
        type: 'class' as const,
        title: e.summary,
        date: toDateString(e.dtStart!),
        start_time: toTimeString(e.dtStart!),
        end_time: toTimeString(e.dtEnd!),
        location: e.location || '',
        repeats_weekly: false,
      }));

      // Deduplicate against existing user items by exact match
      const existingItemsResponse = (await fetchItems?.()) || [];
      const newItems = items.filter(newItem => {
        return !existingItemsResponse.some((existing: any) => 
          existing.type === 'class' && 
          existing.title === newItem.title && 
          existing.date === newItem.date && 
          existing.start_time === newItem.start_time
        );
      });

      if (newItems.length > 0) {
        const inserted = await addItems(newItems as any);
        showToast?.(`Imported ${inserted.length} new class events.`);
      } else {
        showToast?.('No new classes to import. All events are already in your schedule.');
      }
      await fetchItems?.();
      setImportCount(prev => prev + 1);
      
      // Removed automatic navigation
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Failed to import college calendar.';
      showToast?.(msg);
    } finally {
      setImporting(false);
    }
  };

  const importWorkIcs = async () => {
    if (!user?.id) return;
    if (!workFile) {
      showToast?.('Upload a .ics file to import work shifts.');
      return;
    }
    setImporting(true);
    try {
      const text = await workFile.text();
      const events = parseIcs(text).filter(e => e.dtStart && e.dtEnd && e.summary);
      const items = events.map((e) => ({
        user_id: user.id,
        type: 'shift' as const,
        title: e.summary,
        date: toDateString(e.dtStart!),
        start_time: toTimeString(e.dtStart!),
        end_time: toTimeString(e.dtEnd!),
        location: e.location || '',
        role: '',
        repeats_weekly: false,
      }));

      // Deduplicate against existing user items by exact match
      const existingItemsResponse = (await fetchItems?.()) || [];
      const newItems = items.filter(newItem => {
        return !existingItemsResponse.some((existing: any) => 
          existing.type === 'shift' && 
          existing.title === newItem.title && 
          existing.date === newItem.date && 
          existing.start_time === newItem.start_time
        );
      });

      if (newItems.length > 0) {
        const inserted = await addItems(newItems as any);
        showToast?.(`Imported ${inserted.length} new work shift events.`);
      } else {
        showToast?.('No new shifts to import. All events are already in your schedule.');
      }
      await fetchItems?.();
      setImportCount(prev => prev + 1);
      
      // Removed automatic navigation
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Failed to import work calendar.';
      showToast?.(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background w-full max-w-[390px] mx-auto relative shadow-sm">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-textSecondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-semibold text-textPrimary">
          Import <span className="text-primary">Your Schedule</span>
        </h1>
      </div>

      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        <p className="text-[15px] font-body text-textSecondary mb-8 leading-relaxed">
          Connect your sources to detect conflicts between work, classes and deadlines.
        </p>

        <div className="flex flex-col gap-3">
          {SOURCES.map(({ id, title, desc, icon: Icon, color, comingSoon }) => {
            const isChecked = importedSources.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleSource(id)}
                disabled={comingSoon}
                className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 mb-3 transition-transform text-left ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98] cursor-pointer'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-base text-textPrimary leading-tight">{title}</h3>
                    {comingSoon && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-textSecondary mt-1">{desc}</p>
                </div>

                {!comingSoon && (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {importedSources.has('college') && (
          <div className="mt-2 bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-sm font-semibold mb-2">Import college calendar (.ics)</div>
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={(e) => setCollegeFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#FFF0EC] file:text-[#F07B5A] hover:file:bg-[#FFE2D9]"
            />
            <button
              type="button"
              onClick={importCollegeIcs}
              disabled={importing || !collegeFile}
              className="mt-3 w-full bg-primary text-white py-3 rounded-full font-display font-semibold disabled:opacity-50 active:scale-[0.98] transition"
            >
              {importing ? 'Importing…' : 'Import college schedule'}
            </button>
          </div>
        )}

        {importedSources.has('work') && (
          <div className="mt-2 bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-sm font-semibold mb-2">Import work shift calendar (.ics)</div>
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={(e) => setWorkFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
            />
            <button
              type="button"
              onClick={importWorkIcs}
              disabled={importing || !workFile}
              className="mt-3 w-full bg-green-500 text-white py-3 rounded-full font-display font-semibold disabled:opacity-50 active:scale-[0.98] transition hover:bg-green-600"
            >
              {importing ? 'Importing…' : 'Import work schedule'}
            </button>
          </div>
        )}
      </main>

      {/* Footer — Skip / Finish link */}
      <div className={`absolute bottom-0 left-0 w-full p-6 z-10 pt-10 flex justify-center ${importCount > 0 ? 'bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]' : 'bg-gradient-to-t from-background via-background to-transparent'}`}>
        <button
          onClick={() => navigate('/home')}
          className={importCount > 0 ? "w-full bg-[#F07B5A] text-white py-3.5 px-6 rounded-full font-display font-semibold hover:bg-[#e06a49] active:scale-95 transition-all shadow-md" : "text-sm text-primary font-medium hover:underline transition-colors"}
        >
          {importCount > 0 ? 'Finish & Go to Dashboard' : 'Skip for now →'}
        </button>
      </div>
    </div>
  );
}
