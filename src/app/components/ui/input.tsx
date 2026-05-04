interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-foreground">{label}</label>
      )}
      <input
        className={`h-10 px-3 rounded-lg border border-input bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-destructive">{error}</span>
      )}
    </div>
  );
}
