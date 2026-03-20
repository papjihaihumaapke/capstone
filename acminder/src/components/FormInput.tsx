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
      <label htmlFor={inputId} className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F07B5A] bg-white ${error ? 'border-red-500' : 'border-gray-200'}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}