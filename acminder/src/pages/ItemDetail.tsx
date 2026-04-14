import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Pencil, Calendar, Clock, MapPin, Briefcase, BookOpen, FileText } from 'lucide-react';
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
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

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
  if (!item) return <div className="p-10 text-center text-sm text-muted animate-pulse">Loading item details…</div>;

  const handleBack = () => {
    if (isEditing) setIsEditing(false);
    else navigate(-1);
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

  const isAssignment = item.type === 'assignment';

  const typeConfig: Record<string, any> = {
    shift: { label: 'Work', bg: 'bg-dark/5', color: 'text-dark', Icon: Briefcase },
    class: { label: 'College', bg: 'bg-dark/5', color: 'text-dark', Icon: BookOpen },
    assignment: { label: 'Task', bg: 'bg-surface', border: 'border border-dark', color: 'text-dark', Icon: FileText },
    routine: { label: 'Habit', bg: 'bg-dark/5', color: 'text-dark', Icon: Clock },
  };
  const cfg = typeConfig[item.type] || typeConfig.shift;
  const headerTag = cfg.border ? `${cfg.bg} ${cfg.border} ${cfg.color}` : `${cfg.bg} ${cfg.color}`;

  const renderFormInput = (label: string, field: string, type = 'text', placeholder?: string) => (
    <div className="mb-4 w-full">
      <label className="block text-caption font-semibold text-dark mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={draft[field] || ''}
        onChange={(e) => setDraft({...draft, [field]: e.target.value})}
        className={`w-full px-4 py-3 rounded-input border bg-surface text-body text-dark font-body placeholder:text-muted focus:outline-none focus:ring-0 transition-colors ${
          errors[field] ? 'border-orange focus:border-orange' : 'border-border focus:border-dark'
        }`}
      />
      {errors[field] && <p className="text-caption text-orange mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark/40 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
      {/* Background click to close */}
      <div 
        className="flex-1 w-full"
        onClick={handleBack} 
        style={{ cursor: 'pointer' }}
      />

      {/* Bottom Sheet Modal */}
      <div className="bg-surface rounded-t-[24px] w-full max-w-[480px] mx-auto px-5 pt-3 pb-8 max-h-[90vh] overflow-y-auto no-scrollbar relative flex flex-col">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto flex-shrink-0 mb-5" />

        <div className="flex justify-between items-center mb-6">
           <h1 className="text-h3 text-dark font-display">{isEditing ? 'Edit Item' : 'Item Details'}</h1>
           {!isEditing && (
             <button onClick={onDelete} className="w-9 h-9 rounded-full bg-peach text-orange flex items-center justify-center hover:bg-orange/20 transition-colors shadow-none cursor-pointer">
               <Trash2 size={16} />
             </button>
           )}
        </div>

        {!isEditing ? (
          <>
            <div className={`px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider w-fit mb-3 ${headerTag}`}>
              {cfg.label}
            </div>

            <h2 className="text-h2 font-display text-dark mb-4">{item.title}</h2>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3 text-body font-medium text-muted">
                <Calendar size={18} className="text-dark" />
                {formatDateLabel(isAssignment ? (item as any).due_date : item.date)}
              </div>
              <div className="flex items-center gap-3 text-body font-medium text-muted">
                <Clock size={18} className="text-dark" />
                {isAssignment 
                  ? `Due ${formatTime12((item as any).due_time || '23:59')}` 
                  : `${formatTime12(item.start_time)} \u2013 ${formatTime12(item.end_time)}`}
              </div>

              {(item as any).location && (
                <div className="flex items-center gap-3 text-body font-medium text-muted">
                  <MapPin size={18} className="text-dark" />
                  {(item as any).location}
                </div>
              )}
              {(item as any).course && (
                <div className="flex items-center gap-3 text-body font-medium text-muted">
                  <BookOpen size={18} className="text-dark" />
                  {(item as any).course}
                </div>
              )}
              {(item as any).role && (
                <div className="flex items-center gap-3 text-body font-medium text-muted">
                  <Briefcase size={18} className="text-dark" />
                  {(item as any).role}
                </div>
              )}
            </div>

            <div className="mt-2 text-center text-caption text-muted flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-border rounded-full" />
              {item.completed ? 'Completed' : 'To do'}
              <div className="w-1.5 h-1.5 bg-border rounded-full" />
            </div>

            <button
               onClick={() => setIsEditing(true)}
               className="w-full bg-dark text-white py-3.5 rounded-btn text-body font-semibold mt-4 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all outline-none"
             >
               <Pencil size={18} /> Edit Item
             </button>
          </>
        ) : (
          /* EDIT MODE */
          <>
            {renderFormInput('TITLE', 'title')}

            {!isAssignment ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {renderFormInput('DATE', 'date', 'date')}
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderFormInput('START TIME', 'start_time', 'time')}
                  {renderFormInput('END TIME', 'end_time', 'time')}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                 {renderFormInput('DUE DATE', 'due_date', 'date')}
                 {renderFormInput('DUE TIME', 'due_time', 'time')}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               {renderFormInput('LOCATION', 'location')}
               {renderFormInput(item.type === 'shift' ? 'ROLE' : item.type === 'routine' ? 'CATEGORY' : 'COURSE', item.type === 'shift' ? 'role' : 'course')}
            </div>

            {item.type === 'class' && (
               <label className="flex items-center gap-3 cursor-pointer py-2 mb-4">
               <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${draft.repeats_weekly ? 'bg-dark border-dark' : 'border-border'}`}
                 onClick={() => setDraft({...draft, repeats_weekly: !draft.repeats_weekly})}>
                 {draft.repeats_weekly && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
               </div>
               <input
                 type="checkbox"
                 checked={draft.repeats_weekly}
                 onChange={(e) => setDraft({...draft, repeats_weekly: e.target.checked})}
                 className="sr-only"
               />
               <span className="text-body text-dark font-medium">Repeats every week</span>
             </label>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-surface border border-border text-dark py-3.5 rounded-btn font-semibold hover:bg-appbg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 bg-dark text-white py-3.5 rounded-btn font-semibold disabled:opacity-50 active:scale-95 transition-all"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
