import Person from "../../../types/Person"
import Product from "../../../types/Product"
import { useGeneralAnalytics } from "../../../hooks/useGeneralAnalytics"
import { AnalyticsFilters } from "../../../types/Analytics"
import { DashboardResult, ProductsResults, SuppliersResults } from "../../../types/DashboardResults"
import SummaryStats from "./components/SummaryStats"
import SuppliersCard from "./components/SuppliersCard"
import ProductsCard from "./components/ProductsCard"
import AnalyticsInsights from "./components/AnalyticsInsights"
import LoadingSkeleton from "./components/LoadingSkeleton"
import ErrorState from "./components/ErrorState"
import RefreshButton from "./components/RefreshButton"

interface GeneralDashboardProps {
  supplierProductResults: DashboardResult[]
  productsResults: ProductsResults[]
  suppliersResults: SuppliersResults[]
  filters: {
    supplierId?: string
    productId?: string
    startDate: string
    endDate: string
  }
  suppliers: Person[]
  products: Partial<Product>[]
}

function GeneralDashboard(
  {
    supplierProductResults,
    productsResults,
    suppliersResults,
    filters,
    suppliers,
    products
  }: Readonly<GeneralDashboardProps>
) {
  // Analytics filters
  const analyticsFilters: AnalyticsFilters = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: 'both'
  }

  const {
    dateRangeAnalytics,
    topSuppliers,
    topProducts,
    loading,
    error,
    refetch
  } = useGeneralAnalytics(analyticsFilters)

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      {dateRangeAnalytics && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📈 Analytics General</h2>
            <RefreshButton onRefresh={refetch} loading={loading} />
          </div>

          {/* Summary Statistics */}
          <SummaryStats
            totalSuppliers={dateRangeAnalytics.summary.totalSuppliers}
            totalProducts={dateRangeAnalytics.summary.totalProducts}
            totalWeight={dateRangeAnalytics.summary.totalWeight}
            totalTransactions={dateRangeAnalytics.summary.totalTransactions}
          />

          {/* Top Performers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SuppliersCard
              suppliers={dateRangeAnalytics.topSuppliers}
              title="🏆 Top Proveedores (Mayor Peso)"
              icon="📈"
              colorClass="bg-blue-50 border border-blue-200"
            />

            <ProductsCard
              products={dateRangeAnalytics.topProducts}
              title="🏆 Top Productos (Mayor Peso)"
              icon="📦"
              colorClass="bg-green-50 border border-green-200"
            />
          </div>

          {/* Additional Top Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SuppliersCard
              suppliers={topSuppliers}
              title="💪 Proveedores Más Activos"
              icon="🔄"
              colorClass="bg-purple-50 border border-purple-200"
            />

            <ProductsCard
              products={topProducts}
              title="🚀 Productos Más Comercializados"
              icon="📊"
              colorClass="bg-orange-50 border border-orange-200"
            />
          </div>

          {/* Analytics Insights */}
          <AnalyticsInsights analytics={dateRangeAnalytics} />

          <div className="text-gray-600 mt-6">
            <p className="mb-2">🔍 <strong>Período:</strong> {filters.startDate} al {filters.endDate}</p>
            {filters.supplierId && (
              <p className="mb-2">🏢 <strong>Proveedor:</strong> {suppliers.find(s => s.id === Number(filters.supplierId))?.name || 'No encontrado'}</p>
            )}
            {filters.productId && (
              <p className="mb-2">📦 <strong>Producto:</strong> {products.find(p => p.id === Number(filters.productId))?.name || 'No encontrado'}</p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              💡 Esta vista muestra analytics basados en datos reales de transacciones. Cambia a "Vista Detallada" para ver gráficas completas y opciones de exportación.
            </p>
          </div>
        </div>
      )}

      {/* Legacy Results Section */}
      {(supplierProductResults.length > 0 || productsResults.length > 0 || suppliersResults.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen de Búsqueda</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {supplierProductResults.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Transacciones Proveedor-Producto</h3>
                <p className="text-2xl font-bold text-blue-600">{supplierProductResults.length}</p>
                <p className="text-sm text-blue-600">registros encontrados</p>
              </div>
            )}

            {productsResults.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Productos por Proveedor</h3>
                <p className="text-2xl font-bold text-green-600">{productsResults.length}</p>
                <p className="text-sm text-green-600">productos encontrados</p>
              </div>
            )}

            {suppliers.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Proveedores por Producto</h3>
                <p className="text-2xl font-bold text-purple-600">{suppliersResults.length}</p>
                <p className="text-sm text-purple-600">proveedores encontrados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralDashboard
