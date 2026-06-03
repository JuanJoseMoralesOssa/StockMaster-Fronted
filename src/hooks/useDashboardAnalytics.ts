import { useState } from 'react'
import { analyticsService } from '../services/AnalyticsService'
import {
  DashboardSummaryResponse,
  AnalyticsFilters
} from '../types/Analytics'

interface UseAnalyticsReturn {
  data: DashboardSummaryResponse | null
  loading: boolean
  error: string | null
  refetch: (customFilters?: AnalyticsFilters) => void
}

export const useDashboardAnalytics = (filters: AnalyticsFilters): UseAnalyticsReturn => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (customFilters?: AnalyticsFilters) => {
    const currentFilters = customFilters || filters
    if (!currentFilters.startDate || !currentFilters.endDate) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ahora es una única petición de red
      const response = await analyticsService.getDashboardSummary({
        ...currentFilters,
        limit: currentFilters.limit || 10
      })

      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar analytics')
    } finally {
      setLoading(false)
    }
  }

  // Fires only on manual refetch (search button click), not on mount.
  const refetch = (customFilters?: AnalyticsFilters) => {
    fetchAnalytics(customFilters)
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}
