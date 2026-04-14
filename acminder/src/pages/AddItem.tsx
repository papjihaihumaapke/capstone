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
    <div className="min-h-screen bg-dark/40 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
      {/* Background click to close */}
      <div 
        className="flex-1 w-full"
        onClick={() => navigate('/home')} 
        style={{ cursor: 'pointer' }}
      >
        <div className="absolute top-12 left-6 w-9 h-9 bg-surface/10 rounded-btn flex items-center justify-center hover:bg-surface/20 active:scale-95 transition-all">
          <ArrowLeft size={20} className="text-white" />
        </div>
      </div>

      {/* Bottom Sheet Form */}
      <div className="bg-surface rounded-t-[24px] w-full max-w-[480px] mx-auto px-5 pt-3 pb-8">
        
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-5" />

        <h1 className="text-h3 text-dark font-display mb-4">Add to Schedule</h1>

        <div className="mb-5">
           <TabSwitcher tabs={tabs} activeTab={currentTabDisplay} onTabChange={handleTabChange} />
        </div>

        {renderForm()}

        <div className="mt-8">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-dark text-white py-3.5 rounded-btn text-body font-semibold hover:opacity-90 active:scale-95 transition-all shadow-none disabled:opacity-50"
          >
            {loading ? 'Saving…' : `Save ${currentTabDisplay}`}
          </button>
        </div>
      </div>
    </div>
  );
}
