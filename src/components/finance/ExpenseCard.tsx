import { getIcon } from '@/lib/iconUtils';

interface ExpenseCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: string;
  index: number;
}

export function ExpenseCard({ title, value, subtitle, icon, color, index }: ExpenseCardProps) {
  const IconComponent = getIcon(icon);

  return (
    <div
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold font-mono">
            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <IconComponent className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
