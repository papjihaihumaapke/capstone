import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2, Pencil, Calendar, Clock, MapPin, Briefcase, BookOpen, FileText, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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

function formatDateLabel(dateStr: string | undefined) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  // Standardized to 'short' month initials
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  shift: { label: 'Work Shift', color: 'text-primary', bg: 'bg-primary/10', icon: Briefcase },
  class: { label: 'Class', color: 'text-blue-600', bg: 'bg-blue-50', icon: BookOpen },
  assignment: { label: 'Task', color: 'text-warning', bg: 'bg-warning/10', icon: FileText },
  routine: { label: 'Habit', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock },
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, updateItem, deleteItem, fetchItems, showToast } = useAppContext();

  const item = useMemo(() => (items || []).find((i) => i.id === id), [items, id]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!item) fetchItems?.();
  }, [item, fetchItems]);

  useEffect(() => {
    if (!item) return;
    const i = item as any;
    setDraft({
      title: i.title,
      date: i.date,
      start_time: i.start_time,
      end_time: i.end_time,
      location: i.location || '',
      role: i.role || '',
      repeats_weekly: !!i.repeats_weekly,
      due_date: i.due_date,
      due_time: i.due_time,
      course: i.course || '',
      category: i.category || 'other',
    });
    setErrors({});
  }, [item]);

  if (!id) return null;
  if (!item) return <div className="p-10 text-center text-sm text-textSecondary animate-pulse">Loading item details…</div>;

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      navigate(-1);
    }
  };

  const onSave = async () => {
    if (!updateItem) return;
    const newErrors: Record<string, string> = {};
    if (!draft.title?.trim()) newErrors.title = 'Title is required';
    if (item.type !== 'assignment' && draft.start_time && draft.end_time && draft.end_time <= draft.start_time) {
      newErrors.end_time = 'End time must be after start time';
    }
    if (item.type === 'assignment' && !draft.due_date) newErrors.due_date = 'Due date required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await updateItem(id, draft);
      showToast?.('Changes saved');
      setIsEditing(false);
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteItem) return;
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteItem(id);
      showToast?.('Item deleted');
      navigate('/home');
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.shift;
  const isAssignment = item.type === 'assignment';
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fadeIn">
      {/* ───── Premium Header ───── */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sticky top-0 z-30">
        <div className="flex-1 flex items-center">
          <button 
            onClick={handleBack} 
            className="-ml-2 w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all text-textPrimary" 
            aria-label={isEditing ? "Cancel editing" : "Go back"}
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <h1 className="flex-[2] text-center font-display font-bold text-base text-textPrimary truncate">
          {isEditing ? 'Edit Item' : 'Item Details'}
        </h1>
        <div className="flex-1 flex justify-end">
          {!isEditing && (
            <button 
              onClick={onDelete} 
              className="w-11 h-11 rounded-full flex items-center justify-center text-danger hover:bg-red-50 transition-colors"
              aria-label="Delete item"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 max-w-2xl mx-auto w-full space-y-6">
        {/* ───── Read Mode ───── */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-card border border-gray-100 p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center`}>
                  <Icon size={20} className={cfg.color} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
              </div>

              <div>
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-textPrimary leading-tight mb-2">
                  {item.title}
                </h2>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-textSecondary bg-surface px-3 py-2 rounded-xl">
                    <Calendar size={14} className="text-primary" />
                    {formatDateLabel(isAssignment ? (item as any).due_date : item.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary bg-surface px-3 py-2 rounded-xl">
                    <Clock size={14} className="text-primary" />
                    {isAssignment 
                      ? `Due ${formatTime12((item as any).due_time || '23:59')}` 
                      : `${formatTime12(item.start_time)} \u2013 ${formatTime12(item.end_time)}`}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-50 my-6" />

              <div className="space-y-4">
                {(item as any).location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-textPrimary font-medium">{(item as any).location}</p>
                    </div>
                  </div>
                )}
                {(item as any).course && (
                  <div className="flex items-start gap-3">
                    <BookOpen size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Course</p>
                      <p className="text-sm text-textPrimary font-medium">{(item as any).course}</p>
                    </div>
                  </div>
                )}
                {(item as any).role && (
                  <div className="flex items-start gap-3">
                    <Briefcase size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Role</p>
                      <p className="text-sm text-textPrimary font-medium">{(item as any).role}</p>
                    </div>
                  </div>
                )}
                {((item as any).repeats_weekly) && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full w-fit">
                    <RefreshCw size={12} /> REPEATS WEEKLY
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-primary text-white py-4 rounded-2xl font-display font-bold flex items-center justify-center gap-2 shadow-blue active:scale-[0.98] transition hover:bg-primaryDark"
            >
              <Pencil size={18} /> Edit Item
            </button>
          </div>
        ) : (
          /* ───── Edit Mode ───── */
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] shadow-card border border-gray-100 p-6 lg:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input
                  value={draft.title || ''}
                  onChange={(e) => setDraft({...draft, title: e.target.value})}
                  className={`w-full px-4 py-3.5 rounded-2xl border bg-surface transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none ${errors.title ? 'border-danger' : 'border-border'}`}
                  placeholder="Enter title"
                />
                {errors.title && <p className="text-[10px] text-danger font-bold uppercase ml-1">{errors.title}</p>}
              </div>

              {!isAssignment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                    <input
                      type="date"
                      value={draft.date || ''}
                      onChange={(e) => setDraft({...draft, date: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start</label>
                      <input
                        type="time"
                        value={draft.start_time || ''}
                        onChange={(e) => setDraft({...draft, start_time: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">End</label>
                      <input
                        type="time"
                        value={draft.end_time || ''}
                        onChange={(e) => setDraft({...draft, end_time: e.target.value})}
                        className={`w-full px-4 py-3.5 rounded-2xl border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none ${errors.end_time ? 'border-danger' : 'border-border'}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                    <input
                      type="date"
                      value={draft.due_date || ''}
                      onChange={(e) => setDraft({...draft, due_date: e.target.value})}
                      className={`w-full px-4 py-3.5 rounded-2xl border bg-surface transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none ${errors.due_date ? 'border-danger' : 'border-border'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Due Time</label>
                    <input
                      type="time"
                      value={draft.due_time || ''}
                      onChange={(e) => setDraft({...draft, due_time: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>
                  <input
                    value={draft.location || ''}
                    onChange={(e) => setDraft({...draft, location: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                    placeholder="Physical or virtual location"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{(item.type === 'shift' || item.type === 'routine') ? 'Details' : 'Course'}</label>
                  <input
                    value={item.type === 'shift' ? (draft.role || '') : (draft.course || '')}
                    onChange={(e) => setDraft({...draft, [item.type === 'shift' ? 'role' : 'course']: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none"
                    placeholder="Additional context"
                  />
                </div>
              </div>

              {item.type === 'class' && (
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={!!draft.repeats_weekly}
                    onChange={(e) => setDraft({...draft, repeats_weekly: e.target.checked})}
                    className="w-5 h-5 rounded-md text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-textPrimary">Repeats every week</span>
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-white border border-border text-textPrimary py-4 rounded-2xl font-display font-bold hover:bg-surface transition"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-[2] bg-primary text-white py-4 rounded-2xl font-display font-bold shadow-blue disabled:opacity-60 active:scale-[0.98] transition hover:bg-primaryDark"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
