import { DashboardSummaryResponse } from "../../../types/Analytics"
import SuppliersCard from "./components/SuppliersCard"
import ProductsCard from "./components/ProductsCard"
import AnalyticsInsights from "./components/AnalyticsInsights"
import LoadingSkeleton from "./components/LoadingSkeleton"
import ErrorState from "./components/ErrorState"
import SummaryStats from "./components/SummaryStats"

interface GeneralDashboardProps {
  filters: { startDate: string, endDate: string }
  analyticsData?: DashboardSummaryResponse | null
  analyticsLoading?: boolean
  analyticsError?: string | null
}

function GeneralDashboard({ filters, analyticsData: data, analyticsLoading: loading, analyticsError: error }: GeneralDashboardProps) {

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      {data && (
        <div className="bg-(--color-bg-surface) p-6 rounded-lg shadow-xs border border-(--color-border)">
          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-(--color-text-primary)">
            <span className="h-6 w-1 rounded-full bg-(--view-accent,var(--color-action-bg))" aria-hidden="true" />
            Tablero General
          </h2>

          {/* Summary Metrics — reflects the user's selected date range */}
          <SummaryStats
            totalSuppliers={data.summary.totalSuppliers}
            totalProducts={data.summary.totalProducts}
            totalWeight={data.summary.totalWeight}
            totalTransactions={data.summary.totalTransactions}
          />

          {/* Top Performers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SuppliersCard
              suppliers={data.topSuppliersByWeight}
              title="Mejores Proveedores (Mayor Peso)"
              icon="📈"
              colorClass="bg-(--view-accent-soft,var(--color-bg-subtle)) border-(--view-accent-border,var(--color-border))"
            />

            <ProductsCard
              products={data.topProductsByWeight}
              title="Mejores Productos (Mayor Peso)"
              icon="📦"
              colorClass="bg-(--color-bg-surface) border-(--color-border)"
            />
          </div>

          {/* Additional Top Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SuppliersCard
              suppliers={data.mostActiveSuppliers}
              title="Proveedores Más Activos"
              icon="🔄"
              colorClass="bg-(--color-bg-surface) border-(--color-border)"
            />

            <ProductsCard
              products={data.mostTransactedProducts}
              title="Productos Más Comercializados"
              icon="📊"
              colorClass="bg-(--view-accent-soft,var(--color-bg-subtle)) border-(--view-accent-border,var(--color-border))"
            />
          </div>

          {/* Analytics Insights */}
          <AnalyticsInsights data={data} />

          <div className="text-(--color-text-secondary) mt-6">
            <p className="mb-2">🔍 <strong>Período:</strong> {filters.startDate} al {filters.endDate}</p>
            <p className="text-[13.5px] text-(--color-text-secondary) mt-4 rounded-md bg-(--color-bg-subtle) p-3 border border-(--color-border)">
              💡 Esta vista muestra un análisis con todos los datos globales. Cambia a "Vista Detallada" para ver gráficas puntuales y aplicar filtros exactos por producto o proveedor.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralDashboard
