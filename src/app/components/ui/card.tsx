interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, actions }: CardProps) {
  return (
    <div className={`bg-card rounded-lg border border-border shadow-sm ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            {title && <h3 className="text-card-foreground">{title}</h3>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
