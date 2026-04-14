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
      <label htmlFor={inputId} className="block text-caption font-semibold text-dark mb-1">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-input border bg-surface text-body text-dark font-body placeholder:text-muted focus:outline-none focus:ring-0 transition-colors ${
          error ? 'border-orange focus:border-orange' : 'border-border focus:border-dark'
        }`}
      />
      {error && <p className="text-caption text-orange mt-1">{error}</p>}
    </div>
  );
}
