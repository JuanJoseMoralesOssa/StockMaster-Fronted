// Base component for metric cards - Single Responsibility
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
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
        <div className="text-2xl mb-2">{icon}</div>
      )}
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
      {subtitle && (
        <div className="text-xs opacity-70 mt-1">{subtitle}</div>
      )}
      {trend && (
        <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${trend.isPositive ? 'text-success-700' : 'text-danger-700'
          }`}>
          <span>{trend.isPositive ? '↗️' : '↘️'}</span>
          <span>{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
