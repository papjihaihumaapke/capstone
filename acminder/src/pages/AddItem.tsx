import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
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
        <>
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
        </>
      );
    }
    if (activeTab === 'class') {
      const data = formData.class;
      return (
        <>
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
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${data.repeats_weekly ? 'bg-primary border-primary' : 'border-border'}`}
              onClick={() => updateFormData('repeats_weekly', !data.repeats_weekly)}>
              {data.repeats_weekly && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <input
              type="checkbox"
              checked={data.repeats_weekly}
              onChange={(e) => updateFormData('repeats_weekly', e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-textPrimary font-medium">Repeats every week</span>
          </label>
        </>
      );
    }
    if (activeTab === 'assignment') {
      const data = formData.assignment;
      return (
        <>
          <FormInput label="Task Title" placeholder="e.g. Research Paper" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Due Date" type="date" value={data.due_date} onChange={(v) => updateFormData('due_date', v)} error={errors.due_date} />
            <FormInput label="Due Time (optional)" type="time" value={data.due_time} onChange={(v) => updateFormData('due_time', v)} />
          </div>
          <FormInput label="Course" placeholder="e.g. CS 101" value={data.course} onChange={(v) => updateFormData('course', v)} />
        </>
      );
    }
    if (activeTab === 'routine') {
      const data = formData.routine;
      return (
        <>
          <FormInput label="Habit Name" placeholder="e.g. Morning Gym" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <div className="mb-4">
            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['sleep', 'gym', 'meal', 'study', 'other'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateFormData('category', cat)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    data.category === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-border text-textSecondary hover:border-indigo-400'
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
          <p className="text-xs text-textSecondary mt-2">
            Routines repeat automatically every week to protect your time.
          </p>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
      {/* Header with blue gradient */}
      <div className="bg-blue-gradient px-4 pt-10 pb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/8" />
        <div className="max-w-lg lg:max-w-xl mx-auto flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/home')}
            className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-display font-bold text-white">Add to Schedule</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-xl mx-auto px-4 lg:px-0 py-5 -mt-3 relative z-10">
        <div className="bg-white rounded-3xl shadow-elevated border border-border p-5">
          <TabSwitcher tabs={tabs} activeTab={currentTabDisplay} onTabChange={handleTabChange} />
          <div className="mt-6">
            {renderForm()}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-4 bg-primary text-white py-4 rounded-2xl font-display font-semibold hover:bg-primaryDark active:scale-[0.98] transition-all disabled:opacity-50 shadow-blue"
        >
          {loading ? 'Saving…' : `Save ${currentTabDisplay}`}
        </button>
      </div>
    </div>
  );
}
