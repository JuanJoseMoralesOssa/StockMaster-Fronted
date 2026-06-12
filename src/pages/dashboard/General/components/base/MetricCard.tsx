import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// Base component for metric cards - Single Responsibility
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = "bg-(--color-bg-subtle)",
  trend
}: Readonly<MetricCardProps>) {
  return (
    <div className={`${colorClass} p-4 rounded-lg text-center relative shadow-xs`}>
      {icon && (
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-(--view-accent-soft,var(--color-bg-subtle)) text-(--view-accent-text,var(--color-text-link))">
          {icon}
        </div>
      )}
      <div className="text-xl sm:text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
      {subtitle && (
        <div className="text-xs opacity-70 mt-1">{subtitle}</div>
      )}
      {trend && (
        <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${trend.isPositive ? 'text-success-700' : 'text-danger-700'
          }`}>
          {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
