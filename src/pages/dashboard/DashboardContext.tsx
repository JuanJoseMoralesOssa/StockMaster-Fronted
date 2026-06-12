import { createContext, useContext, useState, type ReactNode } from 'react'
import { useDashboardData, type DashboardFilters, type SummaryType, type SelectedFilter } from './hooks/useDashboardData'
import { useInventorySummary } from '../../hooks/useInventorySummary'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { getPreviousPeriodRange } from './utils/dateHelpers'
import type { UseAnalyticsReturn } from '../../hooks/useDashboardAnalytics'
import type { DashboardResult, PersonReportRow, ProductReportRow } from '../../types/DashboardResults'
import type Person from '../../types/Person'
import type Product from '../../types/Product'

export type DashboardMode = 'detailed' | 'general'

interface DashboardContextValue {
  loading: boolean
  error: string | null
  filters: DashboardFilters
  selectedFilter: SelectedFilter
  summaryType: SummaryType
  products: Partial<Product>[]
  suppliers: Person[]
  supplierProductResults: DashboardResult[]
  suppliersResults: ProductReportRow[]
  productsResults: PersonReportRow[]
  analytics: UseAnalyticsReturn
  prevAnalytics: UseAnalyticsReturn
  setFilters: (f: DashboardFilters) => void
  setSelectedFilter: (f: string) => void
  changeSummaryType: (type: SummaryType) => void
  fetchData: () => void
  resetFilters: () => void
  clearResults: () => void
  dashboardMode: DashboardMode
  setDashboardMode: (mode: DashboardMode) => void
  inventory: ReturnType<typeof useInventorySummary>
  refreshAnalytics: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('detailed')
  const dashboardData = useDashboardData()
  const inventory = useInventorySummary()

  // refreshAnalytics is called by useAutoRefresh (stored in a ref there),
  // so the function identity does not need to be stable.
  const refreshAnalytics = () => {
    const { filters, summaryType, analytics, prevAnalytics } = dashboardData
    if (filters.startDate && filters.endDate) {
      analytics.refetch({ startDate: filters.startDate, endDate: filters.endDate, type: summaryType })
      const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
      prevAnalytics.refetch({ startDate: prev.startDate, endDate: prev.endDate, type: summaryType })
    }
  }

  useAutoRefresh(() => {
    inventory.refetch()
    refreshAnalytics()
  })

  return (
    <DashboardContext.Provider
      value={{ ...dashboardData, dashboardMode, setDashboardMode, inventory, refreshAnalytics }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook in one file is standard
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>')
  return ctx
}
