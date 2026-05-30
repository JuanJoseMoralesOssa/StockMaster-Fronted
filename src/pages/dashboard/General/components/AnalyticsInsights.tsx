import { Brain, BarChart3, TrendingUp, Trophy, Star } from "lucide-react"
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
      icon: <BarChart3 className="w-4 h-4" />,
      borderColor: "border-(--view-accent,var(--color-action-bg))"
    },
    ...(insights.weightGap > 0 ? [{
      title: "Brecha de Rendimiento",
      value: `${formatWeight(insights.weightGap)} kg`,
      description: "Entre el mejor y el peor proveedor",
      icon: <TrendingUp className="w-4 h-4" />,
      borderColor: "border-(--view-accent,var(--color-action-bg))"
    }] : []),
    ...(insights.topSupplier ? [{
      title: "Líder del Período",
      value: insights.topSupplier.personName,
      description: `${formatWeight(insights.topSupplier.totalWeight)} kg en ${insights.topSupplier.transactionCount} transacciones`,
      icon: <Trophy className="w-4 h-4" />,
      borderColor: "border-(--view-accent,var(--color-action-bg))"
    }] : []),
    ...(insights.topProduct ? [{
      title: "Producto Estrella",
      value: insights.topProduct.productName,
      description: `${formatWeight(insights.topProduct.totalWeight)} kg comercializados`,
      icon: <Star className="w-4 h-4" />,
      borderColor: "border-(--view-accent,var(--color-action-bg))"
    }] : [])
  ]

  if (summary.totalSuppliers === 0 && summary.totalTransactions === 0) return null

  return (
    <div className="bg-(--view-accent-soft,var(--color-bg-subtle)) p-6 rounded-lg border border-(--view-accent-border,var(--color-border))">
      <h3 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-(--view-accent-text,var(--color-text-link))" />
        Estadísticas Inteligentes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insightCards.map((card) => (
          <InsightCard
            key={card.title}
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
