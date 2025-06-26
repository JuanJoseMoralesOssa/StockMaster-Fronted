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
      colorClass: "bg-blue-50 text-blue-800"
    },
    {
      title: "Productos Manejados",
      value: totalProducts,
      icon: "📦",
      colorClass: "bg-green-50 text-green-800"
    },
    {
      title: "Kg Totales",
      value: totalWeight.toFixed(2),
      icon: "⚖️",
      colorClass: "bg-purple-50 text-purple-800"
    },
    {
      title: "Transacciones",
      value: totalTransactions,
      icon: "📊",
      colorClass: "bg-orange-50 text-orange-800"
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
