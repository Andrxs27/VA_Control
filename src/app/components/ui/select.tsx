interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-foreground">{label}</label>
      )}
      <select
        className={`h-10 px-3 rounded-lg border border-input bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-destructive">{error}</span>
      )}
    </div>
  );
}
