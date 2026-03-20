import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

type ShiftForm = { title: string; date: string; start_time: string; end_time: string; location: string; role: string };
type ClassForm = { title: string; date: string; start_time: string; end_time: string; location: string; repeats_weekly: boolean };
type AssignmentForm = { title: string; due_date: string; due_time: string; course: string };

export function useItemForm() {
  const navigate = useNavigate();
  const ctx = useContext(AppContext);
  const { addItem, detectConflicts, showToast } = ctx || {};

  const [activeTab, setActiveTab] = useState<'shift' | 'class' | 'assignment'>('shift');

  const [formData, setFormData] = useState<{ shift: ShiftForm; class: ClassForm; assignment: AssignmentForm }>({
    shift: { title: '', date: '', start_time: '', end_time: '', location: '', role: '' },
    class: { title: '', date: '', start_time: '', end_time: '', location: '', repeats_weekly: false },
    assignment: { title: '', due_date: '', due_time: '', course: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (activeTab === 'shift') {
      const data = formData.shift;
      if (!data.title) newErrors.title = 'Title is required';
      if (!data.date) newErrors.date = 'Date is required';
      if (!data.start_time) newErrors.start_time = 'Start time is required';
      if (!data.end_time) newErrors.end_time = 'End time is required';
    } else if (activeTab === 'class') {
      const data = formData.class;
      if (!data.title) newErrors.title = 'Title is required';
      if (!data.date) newErrors.date = 'Date is required';
      if (!data.start_time) newErrors.start_time = 'Start time is required';
      if (!data.end_time) newErrors.end_time = 'End time is required';
    } else if (activeTab === 'assignment') {
      const data = formData.assignment;
      if (!data.title) newErrors.title = 'Title is required';
      if (!data.due_date) newErrors.due_date = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate() || !addItem) return;
    setLoading(true);
    try {
      if (activeTab === 'shift') {
        const data = formData.shift;
        await addItem({
          type: 'shift',
          title: data.title,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          location: data.location,
          role: data.role,
          user_id: ctx?.user?.id || ''
        });
      } else if (activeTab === 'class') {
        const data = formData.class;
        await addItem({
          type: 'class',
          title: data.title,
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          location: data.location,
          repeats_weekly: data.repeats_weekly,
          user_id: ctx?.user?.id || ''
        });
      } else if (activeTab === 'assignment') {
        const data = formData.assignment;
        const time = data.due_time || '00:00';
        await addItem({
          type: 'assignment',
          title: data.title,
          date: data.due_date,
          start_time: time,
          end_time: time,
          course: data.course,
          due_date: data.due_date,
          due_time: data.due_time,
          user_id: ctx?.user?.id || ''
        });
      }
      detectConflicts && detectConflicts();
      showToast && showToast('Item added successfully!');
      navigate('/home');
    } catch (error: unknown) {
      const e = error as any;
      const message =
        (typeof e?.message === 'string' && e.message) ||
        (typeof e?.error_description === 'string' && e.error_description) ||
        (typeof e?.details === 'string' && e.details) ||
        `Failed to add item${typeof e?.code === 'string' ? ` (code ${e.code})` : ''}`;
      showToast && showToast(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    formData,
    activeForm: formData[activeTab],
    updateFormData,
    validate,
    submit,
    loading,
    errors
  };
}