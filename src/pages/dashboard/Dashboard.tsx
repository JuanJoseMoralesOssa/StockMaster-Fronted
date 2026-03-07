import { useState } from 'react'
import Filters from './Filters'
import ModeToggleDashboard from './ModeToggle'
import RenderingWithMode from './RenderingWithMode'
import DashboardHeader from './components/DashboardHeader'
import KpiCards from './components/KpiCards'
import ActionButtons from './components/ActionButtons'
import EmptyState from './components/EmptyState'
import { useDashboardData } from './hooks/useDashboardData'
import { getTodayFormatted } from './utils/dateHelpers'

type DashboardMode = 'detailed' | 'general'

export default function SupplierPaymentReport() {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('detailed')

  const {
    loading,
    error,
    filters,
    selectedFilter,
    products,
    suppliers,
    supplierProductResults,
    suppliersResults,
    productsResults,
    analytics,
    prevAnalytics,
    setFilters,
    setSelectedFilter,
    fetchData,
    resetFilters,
    clearResults,
  } = useDashboardData()

  const handleModeChange = (newMode: DashboardMode) => {
    setDashboardMode(newMode)
    clearResults()
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-xl font-semibold text-primary">Cargando datos...</div>
    </div>
  )

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {error}
    </div>
  )

  const showEmptyState =
    !filters.startDate && !filters.endDate && !filters.supplierId && !filters.productId && dashboardMode === 'detailed'

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen w-full">
      <DashboardHeader
        title="Reporte de Operaciones"
        subtitle="Consulta y analiza resultados por período, proveedor o producto"
        dateFormatted={getTodayFormatted()}
      />

      <KpiCards
        current={analytics.data?.summary}
        previous={prevAnalytics.data?.summary}
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-5 pt-5 pb-0 border-b border-gray-100 flex items-center justify-between">
          <ModeToggleDashboard
            dashboardMode={dashboardMode}
            handleModeChange={handleModeChange}
          />
        </div>

        <div className="p-5 border-b border-gray-100 bg-[#fafbfc]">
          <div className="flex flex-col gap-4">
            <Filters
              filters={filters}
              setFilters={setFilters}
              products={products}
              suppliers={suppliers}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              dashboardMode={dashboardMode}
            />
            <ActionButtons onSearch={fetchData} onClear={resetFilters} />
          </div>
        </div>

        <div className="p-5">
          <RenderingWithMode
            dashboardMode={dashboardMode}
            filters={filters}
            products={products}
            suppliers={suppliers}
            suppliersResults={suppliersResults}
            productsResults={productsResults}
            supplierProductResults={supplierProductResults}
            selectedFilter={selectedFilter}
            analyticsData={analytics.data}
            analyticsLoading={analytics.loading}
            analyticsError={analytics.error}
          />

          {showEmptyState && <EmptyState />}
        </div>
      </div>
    </div>
  )
}
