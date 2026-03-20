import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Briefcase, CalendarDays, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { parseIcs, toDateString, toTimeString } from '../lib/ics';
import { addItems } from '../lib/supabase';

const SOURCES = [
  { id: 'college', title: 'College Timetable', desc: 'Import your class calendar', icon: CalendarIcon, color: 'bg-blue-50 text-blue-600' },
  { id: 'work', title: 'Work Shift Schedule', desc: 'Sync your work shifts', icon: Briefcase, color: 'bg-green-50 text-green-600' },
  { id: 'external', title: 'Google/Apple Calendar', desc: 'Connect external calendars', icon: CalendarDays, color: 'bg-orange-50 text-orange-600' }
];

export default function ImportSchedule() {
  const navigate = useNavigate();
  const { importedSources, setImportedSources, user, showToast } = useAppContext();
  const [collegeFile, setCollegeFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const toggleSource = (id: string) => {
    setImportedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const importCollegeIcs = async () => {
    if (!user?.id) {
      showToast?.('Please log in to import.');
      navigate('/login');
      return;
    }
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

      const inserted = await addItems(items as any);
      showToast?.(`Imported ${inserted.length} class events.`);
      navigate('/home');
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Failed to import calendar.';
      showToast?.(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background w-full max-w-[390px] mx-auto relative shadow-sm">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 flex items-center gap-3">
        <button onClick={() => navigate('/signup')} className="p-2 -ml-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-textSecondary">
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
          {SOURCES.map(({ id, title, desc, icon: Icon, color }) => {
            const isChecked = importedSources.has(id);
            return (
              <button
                key={id}
                onClick={() => toggleSource(id)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 mb-3 active:scale-[0.98] transition-transform text-left"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-base text-textPrimary leading-tight mb-1">{title}</h3>
                  <p className="font-body text-sm text-textSecondary">{desc}</p>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {importedSources.has('college') && (
          <div className="mt-2 bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-sm font-semibold mb-2">Import classwork calendar (.ics)</div>
            <input
              type="file"
              accept=".ics,text/calendar"
              onChange={(e) => setCollegeFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#FFF0EC] file:text-[#F07B5A] hover:file:bg-[#FFE2D9]"
            />
            <button
              type="button"
              onClick={importCollegeIcs}
              disabled={importing}
              className="mt-3 w-full bg-primary text-white py-3 rounded-full font-display font-semibold disabled:opacity-60 active:scale-[0.98] transition"
            >
              {importing ? 'Importing…' : 'Import now'}
            </button>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent z-10 pt-10">
        <button 
          onClick={() => navigate('/home')}
          disabled={importedSources.size === 0}
          className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
