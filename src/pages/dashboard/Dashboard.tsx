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
import { Alert } from '../../components/ui'

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
      <div className="text-xl font-semibold text-[var(--view-accent-text,var(--color-text-link))]">Cargando datos...</div>
    </div>
  )

  if (error) return (
    <Alert variant="danger" title="No se pudo cargar el reporte">
      {error}
    </Alert>
  )

  const showEmptyState =
    !filters.startDate && !filters.endDate && !filters.supplierId && !filters.productId && dashboardMode === 'detailed'

  return (
    <div className="min-h-screen w-full bg-(--color-bg-page) p-5 sm:p-6 md:p-8">
      <DashboardHeader
        title="Reporte de Operaciones"
        subtitle="Consulta y analiza resultados por período, proveedor o producto"
        dateFormatted={getTodayFormatted()}
      />

      <KpiCards
        current={analytics.data?.summary}
        previous={prevAnalytics.data?.summary}
      />

      <div className="mb-8 overflow-visible rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs">
        <div className="flex items-center justify-between border-b border-(--color-border) px-5 pt-5 pb-0">
          <ModeToggleDashboard
            dashboardMode={dashboardMode}
            handleModeChange={handleModeChange}
          />
        </div>

        <div className="relative z-20 border-b border-(--color-border) bg-[var(--view-accent-soft,var(--color-bg-subtle))] p-5">
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

        <div className="relative z-0 p-5">
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
