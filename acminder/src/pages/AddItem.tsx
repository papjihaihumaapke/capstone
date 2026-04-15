import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TabSwitcher from '../components/TabSwitcher';
import FormInput from '../components/FormInput';
import { useItemForm } from '../hooks/useItemForm';

export default function AddItem() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, formData, updateFormData, submit, loading, errors } = useItemForm();

  const tabs = ['Work', 'College', 'Tasks', 'Habits'];
  const tabMap = { 
    'Work': 'shift', 
    'College': 'class', 
    'Tasks': 'assignment', 
    'Habits': 'routine' 
  } as const;
  
  const currentTabDisplay =
    (Object.keys(tabMap) as Array<keyof typeof tabMap>).find((k) => tabMap[k] === activeTab) || 'Work';

  const handleTabChange = (tab: string) => {
    const mapped = tabMap[tab as keyof typeof tabMap];
    if (mapped) setActiveTab(mapped);
  };

  const renderForm = () => {
    if (activeTab === 'shift') {
      const data = formData.shift;
      return (
        <div className="flex flex-col gap-1">
          <FormInput label="Title" placeholder="e.g. Opening shift" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Date" type="date" value={data.date} onChange={(v) => updateFormData('date', v)} error={errors.date} />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Time" type="time" value={data.start_time} onChange={(v) => updateFormData('start_time', v)} error={errors.start_time} />
            <FormInput label="End Time" type="time" value={data.end_time} onChange={(v) => updateFormData('end_time', v)} error={errors.end_time} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Location" placeholder="e.g. Store A" value={data.location} onChange={(v) => updateFormData('location', v)} />
            <FormInput label="Role" placeholder="e.g. Cashier" value={data.role} onChange={(v) => updateFormData('role', v)} />
          </div>
        </div>
      );
    }
    if (activeTab === 'class') {
      const data = formData.class;
      return (
        <div className="flex flex-col gap-1">
          <FormInput label="Course Name" placeholder="e.g. Math 101" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Date" type="date" value={data.date} onChange={(v) => updateFormData('date', v)} error={errors.date} />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Time" type="time" value={data.start_time} onChange={(v) => updateFormData('start_time', v)} error={errors.start_time} />
            <FormInput label="End Time" type="time" value={data.end_time} onChange={(v) => updateFormData('end_time', v)} error={errors.end_time} />
          </div>
          <FormInput label="Location" placeholder="e.g. Room 204" value={data.location} onChange={(v) => updateFormData('location', v)} />
          <label className="flex items-center gap-3 cursor-pointer py-2">
            <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${data.repeats_weekly ? 'bg-dark border-dark' : 'border-border'}`}
              onClick={() => updateFormData('repeats_weekly', !data.repeats_weekly)}>
              {data.repeats_weekly && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>
            <input
              type="checkbox"
              checked={data.repeats_weekly}
              onChange={(e) => updateFormData('repeats_weekly', e.target.checked)}
              className="sr-only"
            />
            <span className="text-body text-dark font-medium">Repeats every week</span>
          </label>
        </div>
      );
    }
    if (activeTab === 'assignment') {
      const data = formData.assignment;
      return (
        <div className="flex flex-col gap-1">
          <FormInput label="Task Title" placeholder="e.g. Research Paper" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Due Date" type="date" value={data.due_date} onChange={(v) => updateFormData('due_date', v)} error={errors.due_date} />
            <FormInput label="Due Time (optional)" type="time" value={data.due_time} onChange={(v) => updateFormData('due_time', v)} />
          </div>
          <FormInput label="Course" placeholder="e.g. CS 101" value={data.course} onChange={(v) => updateFormData('course', v)} />
        </div>
      );
    }
    if (activeTab === 'routine') {
      const data = formData.routine;
      return (
        <div className="flex flex-col gap-1">
          <FormInput label="Habit Name" placeholder="e.g. Morning Gym" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="mb-4">
            <label className="block text-caption font-semibold text-dark mb-1">CATEGORY</label>
            <div className="flex flex-wrap gap-2">
              {['sleep', 'gym', 'meal', 'study', 'other'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateFormData('category', cat)}
                  className={`py-1.5 px-4 rounded-[20px] text-caption font-medium capitalize transition-all ${
                    data.category === cat ? 'bg-dark text-white border border-dark' : 'bg-surface text-muted border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start Time" type="time" value={data.start_time} onChange={(v) => updateFormData('start_time', v)} error={errors.start_time} />
            <FormInput label="End Time" type="time" value={data.end_time} onChange={(v) => updateFormData('end_time', v)} error={errors.end_time} />
          </div>
          <p className="text-caption text-muted mt-1">
            Routines repeat automatically every week to protect your time.
          </p>
        </div>
      );
    }
  };

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-50 flex flex-col lg:items-center lg:justify-center animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => navigate(-1)} />

      {/* ── Sheet / Modal ── */}
      <div
        className={[
          'relative z-10 bg-surface w-full overflow-y-auto no-scrollbar',
          /* mobile: bottom sheet */
          'rounded-t-[24px] max-h-[92dvh] mt-auto',
          /* desktop: centered card */
          'lg:rounded-[20px] lg:max-w-[480px] lg:max-h-[85dvh] lg:mx-4 lg:mt-0',
        ].join(' ')}
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        {/* Drag handle (mobile only) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
        </div>

        <div className="px-5 pt-4 pb-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="hidden lg:flex w-8 h-8 rounded-[8px] items-center justify-center hover:bg-appbg transition-colors"
              >
                <ArrowLeft size={16} className="text-dark" />
              </button>
              <h1 className="text-[17px] font-semibold text-dark">Add to Schedule</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center hover:bg-appbg transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="mb-5">
            <TabSwitcher tabs={tabs} activeTab={currentTabDisplay} onTabChange={handleTabChange} />
          </div>

          {renderForm()}

          <div className="mt-6">
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-dark text-white py-3.5 rounded-[12px] text-[14px] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? 'Saving…' : `Save ${currentTabDisplay}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
