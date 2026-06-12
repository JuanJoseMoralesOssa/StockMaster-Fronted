import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Scale, Activity, TrendingDown, Inbox } from "lucide-react"
import { DashboardSummaryResponse, SupplierAnalytics, ProductAnalytics } from "../../../types/Analytics"
import { EmptyState } from "../../../components/ui"
import RankingList from "./components/base/RankingList"
import { supplierToRankingItems, productToRankingItems, formatWeight } from "./components/adapters/analyticsAdapters"
import AnalyticsInsights from "./components/AnalyticsInsights"
import LoadingSkeleton from "./components/LoadingSkeleton"
import ErrorState from "./components/ErrorState"
import SummaryStats from "./components/SummaryStats"

interface GeneralDashboardProps {
  analyticsData?: DashboardSummaryResponse | null
  analyticsLoading?: boolean
  analyticsError?: string | null
  onRetry?: () => void
}

type RankingTabKey = "weight" | "activity" | "bottom"

interface RankingTab {
  key: RankingTabKey
  label: string
  icon: React.ReactNode
  suppliers: SupplierAnalytics[]
  products: ProductAnalytics[]
  supplierAccent: boolean
}

function GeneralDashboard({ analyticsData: data, analyticsLoading: loading, analyticsError: error, onRetry }: GeneralDashboardProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<RankingTabKey>("weight")

  const goToSupplierDetail = (supplierId: number, supplierName: string) => {
    const params = new URLSearchParams({ personId: String(supplierId), personName: supplierName })
    navigate(`/compras?${params.toString()}`)
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data) return null

  const tabs: RankingTab[] = [
    {
      key: "weight",
      label: "Por Peso",
      icon: <Scale className="w-4 h-4" />,
      suppliers: data.topSuppliersByWeight,
      products: data.topProductsByWeight,
      supplierAccent: true,
    },
    {
      key: "activity",
      label: "Por Actividad",
      icon: <Activity className="w-4 h-4" />,
      suppliers: data.mostActiveSuppliers,
      products: data.mostTransactedProducts,
      supplierAccent: false,
    },
    {
      key: "bottom",
      label: "Menor Volumen",
      icon: <TrendingDown className="w-4 h-4" />,
      suppliers: data.bottomSuppliersByWeight,
      products: data.bottomProductsByWeight,
      supplierAccent: false,
    },
  ]

  const current = tabs.find((t) => t.key === activeTab) ?? tabs[0]
  const supplierColor = current.supplierAccent
    ? "bg-(--view-accent-soft,var(--color-bg-subtle)) border-(--view-accent-border,var(--color-border))"
    : "bg-(--color-bg-surface) border-(--color-border)"
  const currentIsEmpty = current.suppliers.length === 0 && current.products.length === 0

  return (
    <div className="space-y-6">
      <div className="bg-(--color-bg-surface) p-4 sm:p-6 rounded-lg shadow-xs border border-(--color-border)">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-xl font-bold text-(--color-text-primary)">
            <span className="h-6 w-1 rounded-full bg-(--view-accent,var(--color-action-bg))" aria-hidden="true" />
            Tablero General
          </h2>
          <SummaryStats
            purchaseWeight={data.summary.totalPurchaseWeight}
            expenseWeight={data.summary.totalExpenseWeight}
          />
        </div>

        {/* Rankings — a single section with tabs instead of three identical grids */}
        <div className="mb-6">
          <div role="tablist" aria-label="Rankings" className="flex flex-wrap gap-2 mb-4 border-b border-(--color-border)">
            {tabs.map((tab) => {
              const selected = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 pointer-coarse:min-h-11 -mb-px text-sm font-semibold border-b-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-focus-ring) rounded-t ${
                    selected
                      ? "border-(--view-accent,var(--color-action-bg)) text-(--view-accent-text,var(--color-text-link))"
                      : "border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </div>

          {currentIsEmpty ? (
            <div role="tabpanel">
              <EmptyState
                icon={<Inbox />}
                title="Sin datos en este período"
                description="No hay proveedores ni productos para mostrar en esta vista con el rango de fechas seleccionado."
              />
            </div>
          ) : (
            <div role="tabpanel" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RankingList
                title="Proveedores"
                items={supplierToRankingItems(current.suppliers)}
                colorClass={supplierColor}
                valueFormatter={formatWeight}
                onItemClick={(item) => goToSupplierDetail(item.id, item.name)}
              />
              <RankingList
                title="Productos"
                items={productToRankingItems(current.products)}
                colorClass="bg-(--color-bg-surface) border-(--color-border)"
                valueFormatter={formatWeight}
              />
            </div>
          )}
        </div>

        {/* Analytics Insights */}
        <AnalyticsInsights data={data} />
      </div>
    </div>
  )
}

export default GeneralDashboard
