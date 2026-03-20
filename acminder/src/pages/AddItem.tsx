import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TabSwitcher from '../components/TabSwitcher';
import FormInput from '../components/FormInput';
import { useItemForm } from '../hooks/useItemForm';

export default function AddItem() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, formData, updateFormData, submit, loading, errors } = useItemForm();

  const tabs = ['Work Shift', 'Class', 'Assignment'];
  const tabMap = { 'Work Shift': 'shift', Class: 'class', Assignment: 'assignment' } as const;
  const currentTabDisplay =
    (Object.keys(tabMap) as Array<keyof typeof tabMap>).find((k) => tabMap[k] === activeTab) || 'Work Shift';

  const handleTabChange = (tab: string) => {
    const mapped = tabMap[tab as keyof typeof tabMap];
    if (mapped) setActiveTab(mapped);
  };

  const renderForm = () => {
    if (activeTab === 'shift') {
      const data = formData.shift;
      return (
        <>
          <FormInput label="Title" placeholder="e.g. Morning Shift" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <FormInput label="Date" type="date" value={data.date} onChange={(v) => updateFormData('date', v)} error={errors.date} />
          <FormInput label="Start Time" type="time" value={data.start_time} onChange={(v) => updateFormData('start_time', v)} error={errors.start_time} />
          <FormInput label="End Time" type="time" value={data.end_time} onChange={(v) => updateFormData('end_time', v)} error={errors.end_time} />
          <FormInput label="Location" placeholder="e.g. Store A" value={data.location} onChange={(v) => updateFormData('location', v)} />
          <FormInput label="Role" placeholder="e.g. Cashier" value={data.role} onChange={(v) => updateFormData('role', v)} />
        </>
      );
    } else if (activeTab === 'class') {
      const data = formData.class;
      return (
        <>
          <FormInput label="Title" placeholder="e.g. Math 101" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <FormInput label="Date" type="date" value={data.date} onChange={(v) => updateFormData('date', v)} error={errors.date} />
          <FormInput label="Start Time" type="time" value={data.start_time} onChange={(v) => updateFormData('start_time', v)} error={errors.start_time} />
          <FormInput label="End Time" type="time" value={data.end_time} onChange={(v) => updateFormData('end_time', v)} error={errors.end_time} />
          <FormInput label="Location" placeholder="e.g. Room 204" value={data.location} onChange={(v) => updateFormData('location', v)} />
          <div className="mb-4">
            <label htmlFor="repeats-weekly" className="flex items-center">
              <input
                id="repeats-weekly"
                type="checkbox"
                checked={data.repeats_weekly}
                onChange={(e) => updateFormData('repeats_weekly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">This class repeats weekly</span>
            </label>
          </div>
        </>
      );
    } else if (activeTab === 'assignment') {
      const data = formData.assignment;
      return (
        <>
          <FormInput label="Title" placeholder="e.g. Essay on History" value={data.title} onChange={(v) => updateFormData('title', v)} error={errors.title} />
          <FormInput label="Due Date" type="date" value={data.due_date} onChange={(v) => updateFormData('due_date', v)} error={errors.due_date} />
          <FormInput label="Due Time (optional)" type="time" value={data.due_time} onChange={(v) => updateFormData('due_time', v)} />
          <FormInput label="Course/Subject" placeholder="e.g. History 101" value={data.course} onChange={(v) => updateFormData('course', v)} />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 animate-fadeIn">
      <header className="flex items-center mb-6">
        <button onClick={() => navigate('/home')} className="mr-4" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold">Add New Item</h1>
      </header>

      <TabSwitcher tabs={tabs} activeTab={currentTabDisplay} onTabChange={handleTabChange} />

      <div className="mb-6">
        {renderForm()}
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-[#F07B5A] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#e06a49] active:scale-95 transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Item'}
      </button>
    </div>
  );
}
