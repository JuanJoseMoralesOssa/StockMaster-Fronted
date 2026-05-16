import MetricCard from "./base/MetricCard";

interface SummaryStatsProps {
  totalSuppliers: number;
  totalProducts: number;
  totalWeight: number;
  totalTransactions: number;
}

function SummaryStats({ totalSuppliers, totalProducts, totalWeight, totalTransactions }: Readonly<SummaryStatsProps>) {
  const metrics = [
    {
      title: "Proveedores Activos",
      value: totalSuppliers,
      icon: "👥",
      colorClass: "bg-[var(--view-accent-soft,var(--color-bg-subtle))] text-[var(--view-accent-text,var(--color-text-link))] border border-[var(--view-accent-border,var(--color-border))]"
    },
    {
      title: "Productos Manejados",
      value: totalProducts,
      icon: "📦",
      colorClass: "bg-(--color-bg-surface) text-(--color-text-primary) border border-(--color-border)"
    },
    {
      title: "Kg Totales",
      value: totalWeight.toFixed(2),
      icon: "⚖️",
      colorClass: "bg-(--color-bg-surface) text-(--color-text-primary) border border-(--color-border)"
    },
    {
      title: "Transacciones",
      value: totalTransactions,
      icon: "📊",
      colorClass: "bg-[var(--view-accent-soft,var(--color-bg-subtle))] text-[var(--view-accent-text,var(--color-text-link))] border border-[var(--view-accent-border,var(--color-border))]"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric) => (
        <MetricCard
          key={`${metric.title}-${metric.icon}`}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          colorClass={metric.colorClass}
        />
      ))}
    </div>
  );
}

export default SummaryStats;
