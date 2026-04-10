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
      <label htmlFor={inputId} className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1.5">{label}</label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all text-textPrimary text-sm placeholder:text-textSecondary/50 ${error ? 'border-danger bg-red-50/50' : 'border-border focus:border-primary'}`}
      />
      {error && <p className="text-danger text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}
