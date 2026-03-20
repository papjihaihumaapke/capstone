import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { ScheduleItem } from '../types';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, updateItem, deleteItem, fetchItems, showToast } = useAppContext();

  const item = useMemo(() => (items || []).find((i) => i.id === id), [items, id]);
  const [draft, setDraft] = useState<Partial<ScheduleItem>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) fetchItems?.();
  }, [item, fetchItems]);

  useEffect(() => {
    if (!item) return;
    setDraft({
      title: item.title,
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location || '',
      role: item.role || '',
      repeats_weekly: !!item.repeats_weekly,
      due_date: item.due_date,
      due_time: item.due_time,
      course: item.course || '',
    });
  }, [item]);

  if (!id) return null;
  if (!item) return <div className="p-6 text-sm text-textSecondary">Loading item…</div>;

  const set = (key: keyof ScheduleItem, value: any) => setDraft((p) => ({ ...p, [key]: value }));

  const onSave = async () => {
    if (!updateItem) return;
    setSaving(true);
    try {
      await updateItem(id, draft);
      showToast?.('Saved.');
      navigate('/home');
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      await deleteItem(id);
      showToast?.('Deleted.');
      navigate('/home');
    } catch (e: any) {
      showToast?.(e?.message || 'Failed to delete.');
    } finally {
      setSaving(false);
    }
  };

  const isAssignment = item.type === 'assignment';

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-gray-100 flex items-center px-4">
        <button onClick={() => navigate('/home')} className="-ml-2 p-2 rounded-full hover:bg-black/5 active:scale-95 transition" aria-label="Go back">
          <ChevronLeft size={22} />
        </button>
        <h1 className="flex-1 text-center font-display font-semibold text-base -ml-8">Edit item</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-2">Title</div>
            <input
              value={draft.title || ''}
              onChange={(e) => set('title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {!isAssignment ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-2">Date</div>
                  <input
                    type="date"
                    value={(draft.date as any) || ''}
                    onChange={(e) => set('date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-semibold mb-2">Start</div>
                    <input
                      type="time"
                      value={(draft.start_time as any) || ''}
                      onChange={(e) => set('start_time', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 font-semibold mb-2">End</div>
                    <input
                      type="time"
                      value={(draft.end_time as any) || ''}
                      onChange={(e) => set('end_time', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-2">Location</div>
                  <input
                    value={(draft.location as any) || ''}
                    onChange={(e) => set('location', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-semibold mb-2">{item.type === 'shift' ? 'Role' : 'Course'}</div>
                  <input
                    value={item.type === 'shift' ? ((draft.role as any) || '') : ((draft.course as any) || '')}
                    onChange={(e) => set(item.type === 'shift' ? 'role' : 'course', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {item.type === 'class' && (
                <label className="flex items-center gap-3 text-sm text-textSecondary">
                  <input
                    type="checkbox"
                    checked={!!draft.repeats_weekly}
                    onChange={(e) => set('repeats_weekly', e.target.checked)}
                  />
                  Repeats weekly
                </label>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-2">Due date</div>
                <input
                  type="date"
                  value={(draft.due_date as any) || ''}
                  onChange={(e) => set('due_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-2">Due time</div>
                <input
                  type="time"
                  value={(draft.due_time as any) || ''}
                  onChange={(e) => set('due_time', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full bg-primary text-white py-4 rounded-full font-display font-semibold disabled:opacity-60 active:scale-[0.98] transition"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        <button
          onClick={onDelete}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-red-200 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-60 transition"
        >
          <Trash2 size={18} />
          Delete item
        </button>
      </div>
    </div>
  );
}
