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
  colorClass = "bg-blue-50",
  trend
}: Readonly<MetricCardProps>) {
  return (
    <div className={`${colorClass} p-4 rounded-lg text-center relative`}>
      {icon && (
        <div className="text-2xl mb-2">{icon}</div>
      )}
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
      {trend && (
        <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
          <span>{trend.isPositive ? '↗️' : '↘️'}</span>
          <span>{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
