import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Pencil, Calendar, Clock, MapPin, Briefcase, BookOpen, FileText, X, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function formatTime12(timeStr: string | undefined) {
  if (!timeStr) return '';
  const t = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
  if (/[AaPp][Mm]$/.test(t)) return t;
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return t;
  const h24 = Number(match[1]);
  if (Number.isNaN(h24)) return t;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${match[2]} ${h24 >= 12 ? 'PM' : 'AM'}`;
}

function formatDateLabel(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

const inputCls = [
  'w-full px-4 py-3 rounded-[10px] bg-white text-[14px] text-[#1A1A1A]',
  'placeholder:text-[#AAAAAA] outline-none transition-all',
  'focus:ring-2 focus:ring-[#1A1A1A]/10',
].join(' ');
const inputBorder  = { border: '1px solid rgba(0,0,0,0.14)' };
const inputErrBorder = { border: '1px solid #E55B45' };

const TYPE_CONFIG: Record<string, { label: string; Icon: any; badgeBg: string; badgeColor: string }> = {
  shift:      { label: 'Work',    Icon: Briefcase, badgeBg: '#F2F2EF', badgeColor: '#1A1A1A' },
  class:      { label: 'College', Icon: BookOpen,  badgeBg: '#F2F2EF', badgeColor: '#1A1A1A' },
  assignment: { label: 'Task',    Icon: FileText,  badgeBg: '#1A1A1A', badgeColor: '#FFFFFF' },
  routine:    { label: 'Habit',   Icon: Clock,     badgeBg: '#F2F2EF', badgeColor: '#1A1A1A' },
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

  useEffect(() => { if (!item) fetchItems?.(); }, [item]);

  useEffect(() => {
    if (!item) return;
    const i = item as any;
    setDraft({
      title: i.title, date: i.date,
      start_time: i.start_time, end_time: i.end_time,
      location: i.location || '', role: i.role || '',
      repeats_weekly: !!i.repeats_weekly,
      due_date: i.due_date, due_time: i.due_time,
      course: i.course || '', category: i.category || 'other',
    });
    setErrors({});
  }, [item]);

  if (!id) return null;
  if (!item) return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.4)] flex items-center justify-center">
      <p className="text-white text-[14px] opacity-70">Loading…</p>
    </div>
  );

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.shift;
  const isAssignment = item.type === 'assignment';

  const handleBack = () => { if (isEditing) setIsEditing(false); else navigate(-1); };

  const onSave = async () => {
    const errs: Record<string, string> = {};
    if (!draft.title?.trim()) errs.title = 'Title is required';
    if (!isAssignment && draft.start_time && draft.end_time && draft.end_time <= draft.start_time)
      errs.end_time = 'End time must be after start time';
    if (isAssignment && !draft.due_date) errs.due_date = 'Due date required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Only send columns that exist in the schedule_items table.
    // 'category' is not a DB column — strip it to avoid schema errors.
    const SAFE_KEYS = ['title', 'date', 'start_time', 'end_time', 'location',
                       'role', 'course', 'due_date', 'due_time', 'repeats_weekly', 'completed'];
    const payload = Object.fromEntries(
      Object.entries(draft).filter(([k]) => SAFE_KEYS.includes(k))
    );

    setSaving(true);
    try {
      await updateItem!(id, payload);
      showToast?.('Changes saved');
      setIsEditing(false);
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteItem!(id);
      showToast?.('Item deleted');
      navigate('/home');
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to delete');
    } finally { setSaving(false); }
  };

  const Field = ({ label: fld, field, type = 'text', placeholder }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[#6B6B6B]">{fld}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={draft[field] || ''}
        onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
        className={inputCls}
        style={errors[field] ? inputErrBorder : inputBorder}
      />
      {errors[field] && <p className="text-[12px] text-[#E55B45]">{errors[field]}</p>}
    </div>
  );

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-50 flex flex-col lg:items-center lg:justify-center animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleBack} />

      {/* ── Sheet / Modal ── */}
      <div
        className={[
          /* shared */
          'relative z-10 bg-white w-full overflow-y-auto no-scrollbar',
          /* mobile: bottom sheet */
          'rounded-t-[24px] max-h-[92dvh]',
          /* desktop: centered card */
          'lg:rounded-[20px] lg:max-w-[480px] lg:max-h-[85dvh] lg:mx-4',
        ].join(' ')}
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        {/* Drag handle (mobile only) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
        </div>

        <div className="px-6 pt-4 pb-8">

          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Desktop back / mobile is drag handle */}
              <button
                onClick={handleBack}
                className="hidden lg:flex w-8 h-8 rounded-[8px] items-center justify-center hover:bg-[#F2F2EF] transition-colors"
              >
                <ArrowLeft size={16} className="text-[#1A1A1A]" />
              </button>
              <h1 className="text-[17px] font-semibold text-[#1A1A1A]">
                {isEditing ? 'Edit Item' : 'Item Details'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={onDelete}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-[#FDF1EF] transition-colors"
                  title="Delete item"
                >
                  <Trash2 size={15} className="text-[#E55B45]" />
                </button>
              )}
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-[#F2F2EF] transition-colors"
              >
                <X size={15} className="text-[#6B6B6B]" />
              </button>
            </div>
          </div>

          {/* ══ VIEW MODE ══════════════════════════════════════ */}
          {!isEditing && (
            <>
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
                >
                  <cfg.Icon size={11} />
                  {cfg.label}
                </span>
                {item.completed && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: '#EFEEEA', color: '#6B6B6B' }}>
                    Completed
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-[22px] font-semibold text-[#1A1A1A] leading-tight mb-5">
                {item.title}
              </h2>

              {/* Detail rows */}
              <div className="space-y-0 rounded-[14px] overflow-hidden"
                style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                {[
                  {
                    Icon: Calendar,
                    label: 'Date',
                    value: formatDateLabel(isAssignment ? (item as any).due_date : item.date),
                  },
                  {
                    Icon: Clock,
                    label: isAssignment ? 'Due' : 'Time',
                    value: isAssignment
                      ? `Due ${formatTime12((item as any).due_time || '23:59')}`
                      : `${formatTime12(item.start_time)} – ${formatTime12(item.end_time)}`,
                  },
                  (item as any).location && {
                    Icon: MapPin, label: 'Location', value: (item as any).location,
                  },
                  (item as any).course && {
                    Icon: BookOpen, label: 'Course', value: (item as any).course,
                  },
                  (item as any).role && {
                    Icon: Briefcase, label: 'Role', value: (item as any).role,
                  },
                ].filter(Boolean).map((row: any, i, arr) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 px-4 py-3.5 bg-white"
                    style={i < arr.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.07)' } : {}}
                  >
                    <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ background: '#F2F2EF' }}>
                      <row.Icon size={14} style={{ color: '#6B6B6B' }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium" style={{ color: '#A8A8A8' }}>{row.label}</p>
                      <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-5 py-3.5 rounded-[12px] text-[14px] font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#1A1A1A', color: '#FFFFFF' }}
              >
                <Pencil size={15} /> Edit Item
              </button>
            </>
          )}

          {/* ══ EDIT MODE ══════════════════════════════════════ */}
          {isEditing && (
            <div className="space-y-4">
              <Field label="Title" field="title" placeholder="Item title" />

              {!isAssignment ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date" field="date" type="date" />
                    <div />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Time" field="start_time" type="time" />
                    <Field label="End Time"   field="end_time"   type="time" />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Due Date" field="due_date" type="date" />
                  <Field label="Due Time" field="due_time" type="time" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" field="location" placeholder="Optional" />
                <Field
                  label={item.type === 'shift' ? 'Role' : 'Course'}
                  field={item.type === 'shift' ? 'role' : 'course'}
                  placeholder="Optional"
                />
              </div>

              {item.type === 'class' && (
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <div
                    className="w-5 h-5 rounded-[5px] flex items-center justify-center transition-all shrink-0"
                    style={{
                      background: draft.repeats_weekly ? '#1A1A1A' : 'transparent',
                      border: draft.repeats_weekly ? '1px solid #1A1A1A' : '1px solid rgba(0,0,0,0.20)',
                    }}
                    onClick={() => setDraft({ ...draft, repeats_weekly: !draft.repeats_weekly })}
                  >
                    {draft.repeats_weekly && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] font-medium text-[#1A1A1A]">Repeats every week</span>
                </label>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3.5 rounded-[12px] text-[14px] font-medium transition-colors"
                  style={{ background: '#F2F2EF', color: '#1A1A1A' }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-[12px] text-[14px] font-medium transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{ background: '#1A1A1A', color: '#FFFFFF' }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
