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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Tablero General</h2>

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
              title="🏆 Mejores Proveedores (Mayor Peso)"
              icon="📈"
              colorClass="bg-blue-50 border border-blue-200"
            />

            <ProductsCard
              products={data.topProductsByWeight}
              title="🏆 Mejores Productos (Mayor Peso)"
              icon="📦"
              colorClass="bg-green-50 border border-green-200"
            />
          </div>

          {/* Additional Top Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SuppliersCard
              suppliers={data.mostActiveSuppliers}
              title="💪 Proveedores Más Activos"
              icon="🔄"
              colorClass="bg-purple-50 border border-purple-200"
            />

            <ProductsCard
              products={data.mostTransactedProducts}
              title="🚀 Productos Más Comercializados"
              icon="📊"
              colorClass="bg-orange-50 border border-orange-200"
            />
          </div>

          {/* Analytics Insights */}
          <AnalyticsInsights data={data} />

          <div className="text-gray-600 mt-6">
            <p className="mb-2">🔍 <strong>Período:</strong> {filters.startDate} al {filters.endDate}</p>
            <p className="text-[13.5px] text-gray-500 mt-4 rounded-md bg-gray-50 p-3 border border-gray-100">
              💡 Esta vista muestra un análisis con todos los datos globales. Cambia a "Vista Detallada" para ver gráficas puntuales y aplicar filtros exactos por producto o proveedor.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralDashboard
