import { DateRangeAnalytics } from "../../../../types/Analytics";
import InsightCard from "./base/InsightCard";
import { calculateInsights, formatWeight } from "./adapters/analyticsAdapters";

interface AnalyticsInsightsProps {
  analytics: DateRangeAnalytics;
}

function AnalyticsInsights({ analytics }: Readonly<AnalyticsInsightsProps>) {
  const { summary, topSuppliers, bottomSuppliers, topProducts } = analytics;

  const insights = calculateInsights(
    summary.totalSuppliers,
    summary.totalWeight,
    summary.totalTransactions,
    topSuppliers,
    bottomSuppliers,
    topProducts
  );

  const insightCards = [
    {
      title: "Promedio por Proveedor",
      value: `${formatWeight(insights.avgWeightPerSupplier)} kg`,
      description: `${insights.avgTransactionsPerSupplier.toFixed(1)} transacciones en promedio`,
      icon: "📊",
      borderColor: "border-blue-500"
    },
    ...(insights.weightGap > 0 ? [{
      title: "Brecha de Rendimiento",
      value: `${formatWeight(insights.weightGap)} kg`,
      description: "Entre el top y bottom proveedor",
      icon: "📈",
      borderColor: "border-orange-500"
    }] : []),
    ...(insights.topSupplier ? [{
      title: "Líder del Período",
      value: insights.topSupplier.personName,
      description: `${formatWeight(insights.topSupplier.totalWeight)} kg en ${insights.topSupplier.transactionCount} transacciones`,
      icon: "🏆",
      borderColor: "border-green-500"
    }] : []),
    ...(insights.topProduct ? [{
      title: "Producto Estrella",
      value: insights.topProduct.productName,
      description: `${formatWeight(insights.topProduct.totalWeight)} kg comercializados`,
      icon: "⭐",
      borderColor: "border-purple-500"
    }] : [])
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🧠 Insights Inteligentes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insightCards.map((card) => (
          <InsightCard
            key={`${card.title}-${card.icon}`}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            borderColor={card.borderColor}
          />
        ))}
      </div>
    </div>
  );
}

export default AnalyticsInsights;
