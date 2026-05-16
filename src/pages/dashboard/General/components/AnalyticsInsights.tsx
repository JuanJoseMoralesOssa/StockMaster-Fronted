import { DashboardSummaryResponse } from "../../../../types/Analytics"
import InsightCard from "./base/InsightCard"
import { calculateInsights, formatWeight } from "./adapters/analyticsAdapters"

interface AnalyticsInsightsProps {
  data: DashboardSummaryResponse
}

function AnalyticsInsights({ data }: Readonly<AnalyticsInsightsProps>) {
  const {
    summary,
    topSuppliersByWeight: topSuppliers,
    bottomSuppliersByWeight: bottomSuppliers,
    topProductsByWeight: topProducts
  } = data

  const insights = calculateInsights(
    summary.totalSuppliers,
    summary.totalWeight,
    summary.totalTransactions,
    topSuppliers,
    bottomSuppliers,
    topProducts
  )

  const insightCards = [
    {
      title: "Promedio por Proveedor",
      value: `${formatWeight(insights.avgWeightPerSupplier)} kg`,
      description: `${insights.avgTransactionsPerSupplier.toFixed(1)} transacciones en promedio`,
      icon: "📊",
      borderColor: "border-[var(--view-accent,var(--color-action-bg))]"
    },
    ...(insights.weightGap > 0 ? [{
      title: "Brecha de Rendimiento",
      value: `${formatWeight(insights.weightGap)} kg`,
      description: "Entre el mejor y el peor proveedor",
      icon: "📈",
      borderColor: "border-[var(--view-accent,var(--color-action-bg))]"
    }] : []),
    ...(insights.topSupplier ? [{
      title: "Líder del Período",
      value: insights.topSupplier.personName,
      description: `${formatWeight(insights.topSupplier.totalWeight)} kg en ${insights.topSupplier.transactionCount} transacciones`,
      icon: "🏆",
      borderColor: "border-[var(--view-accent,var(--color-action-bg))]"
    }] : []),
    ...(insights.topProduct ? [{
      title: "Producto Estrella",
      value: insights.topProduct.productName,
      description: `${formatWeight(insights.topProduct.totalWeight)} kg comercializados`,
      icon: "⭐",
      borderColor: "border-[var(--view-accent,var(--color-action-bg))]"
    }] : [])
  ]

  return (
    <div className="bg-[var(--view-accent-soft,var(--color-bg-subtle))] p-6 rounded-lg border border-[var(--view-accent-border,var(--color-border))]">
      <h3 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
        🧠 Estadísticas Inteligentes
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
  )
}

export default AnalyticsInsights
