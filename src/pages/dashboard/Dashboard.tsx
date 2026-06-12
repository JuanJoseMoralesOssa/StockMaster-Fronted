import { useState } from 'react'
import Filters from './Filters'
import ModeToggleDashboard from './ModeToggle'
import RenderingWithMode from './RenderingWithMode'
import DashboardHeader from './components/DashboardHeader'
import KpiCards from './components/KpiCards'
import InventoryKpis from './components/InventoryKpis'
import ActionButtons from './components/ActionButtons'
import EmptyState from './components/EmptyState'
import { useDashboardData } from './hooks/useDashboardData'
import { useInventorySummary } from '../../hooks/useInventorySummary'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { getTodayFormatted, getPreviousPeriodRange } from './utils/dateHelpers'
import SummaryTypeToggle from './components/SummaryTypeToggle'
import { Alert } from '../../components/ui'

type DashboardMode = 'detailed' | 'general'

export default function Dashboard() {
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
    summaryType,
    analytics,
    prevAnalytics,
    setFilters,
    setSelectedFilter,
    changeSummaryType,
    fetchData,
    resetFilters,
    clearResults,
  } = useDashboardData()

  const inventory = useInventorySummary()

  // Refetch current + previous-period analytics for the selected range/type.
  const refreshAnalytics = () => {
    if (filters.startDate && filters.endDate) {
      analytics.refetch({ startDate: filters.startDate, endDate: filters.endDate, type: summaryType })
      const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
      prevAnalytics.refetch({ startDate: prev.startDate, endDate: prev.endDate, type: summaryType })
    }
  }

  // Keep the always-visible summary current: refresh inventory + KPIs every 5
  // minutes. Detailed search results are left untouched to avoid a flash.
  useAutoRefresh(() => {
    inventory.refetch()
    refreshAnalytics()
  })

  const handleModeChange = (newMode: DashboardMode) => {
    setDashboardMode(newMode)
    clearResults()
  }

  const showEmptyState =
    !filters.startDate && !filters.endDate && !filters.supplierId && !filters.productId && dashboardMode === 'detailed'

  return (
    <div className="min-h-full w-full bg-(--color-bg-page) p-5 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <DashboardHeader
          title="Reporte de Operaciones"
          subtitle="Consulta y analiza resultados por período, proveedor o producto"
          dateFormatted={getTodayFormatted()}
        />

        <KpiCards
          current={analytics.data?.summary}
          previous={prevAnalytics.data?.summary}
          loading={analytics.loading}
        />

        <InventoryKpis data={inventory.data} loading={inventory.loading} />

        <hr className="border-t border-(--color-border) mb-8 -mt-2" />

        <div className="mb-8 overflow-visible rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--color-border) px-5 pt-5 pb-3">
            <ModeToggleDashboard
              dashboardMode={dashboardMode}
              handleModeChange={handleModeChange}
            />
            <SummaryTypeToggle value={summaryType} onChange={changeSummaryType} />
          </div>

          <div className="relative z-20 border-b border-(--color-border) bg-(--view-accent-soft,var(--color-bg-subtle)) p-4 sm:p-5">
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
              <ActionButtons onSearch={fetchData} onClear={resetFilters} loading={loading} />

              {error && (
                <Alert variant="danger" title="No se pudo cargar el reporte">
                  {error}
                </Alert>
              )}
            </div>
          </div>

          <div className="relative z-0 p-4 sm:p-5">
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
              onAnalyticsRetry={refreshAnalytics}
            />

            {showEmptyState && <EmptyState />}
          </div>
        </div>
      </div>
    </div>
  )
}
