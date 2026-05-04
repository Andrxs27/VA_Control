interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'primary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    primary: 'bg-primary/10 text-primary'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
