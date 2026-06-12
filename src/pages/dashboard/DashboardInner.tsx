import Filters from './Filters'
import ModeToggleDashboard from './ModeToggle'
import RenderingWithMode from './RenderingWithMode'
import DashboardHeader from './components/DashboardHeader'
import KpiCards from './components/KpiCards'
import InventoryKpis from './components/InventoryKpis'
import ActionButtons from './components/ActionButtons'
import EmptyState from './components/EmptyState'
import SummaryTypeToggle from './components/SummaryTypeToggle'
import { Alert } from '../../components/ui'
import { useDashboard } from './DashboardContext'
import { getTodayFormatted } from './utils/dateHelpers'

export default function DashboardInner() {
  const {
    loading,
    error,
    filters,
    analytics,
    prevAnalytics,
    inventory,
    dashboardMode,
    setDashboardMode,
    summaryType,
    changeSummaryType,
    fetchData,
    resetFilters,
    clearResults,
  } = useDashboard()

  const showEmptyState =
    !filters.startDate &&
    !filters.endDate &&
    !filters.supplierId &&
    !filters.productId &&
    dashboardMode === 'detailed'

  const handleModeChange = (mode: 'detailed' | 'general') => {
    setDashboardMode(mode)
    clearResults()
  }

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
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                fetchData()
              }}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="min-w-0 flex-1">
                  <Filters />
                </div>
                <div className="shrink-0">
                  <ActionButtons onClear={resetFilters} loading={loading} />
                </div>
              </div>

              {error && (
                <Alert variant="danger" title="No se pudo cargar el reporte">
                  {error}
                </Alert>
              )}
            </form>
          </div>

          <div className="relative z-0 p-4 sm:p-5">
            <RenderingWithMode />
            {showEmptyState && <EmptyState />}
          </div>
        </div>
      </div>
    </div>
  )
}
