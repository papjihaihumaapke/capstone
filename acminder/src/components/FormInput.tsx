import { Calendar, Clock } from 'lucide-react';

interface FormInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  error?: string;
}

export default function FormInput({ label, placeholder, type = 'text', value, onChange, id, error }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onClick={(e) => {
            if (type === 'date' || type === 'time') {
              try { (e.target as HTMLInputElement).showPicker(); } catch (err) {}
            }
          }}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F07B5A] bg-white transition-shadow outline-none text-gray-800 ${error ? 'border-red-500' : 'border-gray-200'} ${type === 'date' || type === 'time' ? 'custom-datetime-input' : ''}`}
        />
        {type === 'date' && <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />}
        {type === 'time' && <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}