import { useCallback, useEffect, useRef, useState } from 'react'
import { analyticsService } from '../services/AnalyticsService'
import {
  DashboardSummaryResponse,
  AnalyticsFilters
} from '../types/Analytics'

export interface UseAnalyticsReturn {
  data: DashboardSummaryResponse | null
  loading: boolean
  error: string | null
  refetch: (customFilters?: AnalyticsFilters) => void
}

export const useDashboardAnalytics = (filters: AnalyticsFilters): UseAnalyticsReturn => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Los filtros se leen vía ref para que `refetch` sea estable y pueda usarse
  // como dependencia de efectos/callbacks sin recrearse en cada render.
  const filtersRef = useRef(filters)

  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fires only on manual refetch (search button click), not on mount.
  const refetch = useCallback((customFilters?: AnalyticsFilters) => {
    const currentFilters = customFilters || filtersRef.current
    if (!currentFilters.startDate || !currentFilters.endDate) {
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    analyticsService
      .getDashboardSummary({
        ...currentFilters,
        limit: currentFilters.limit || 10
      })
      .then(response => {
        if (isMountedRef.current && requestIdRef.current === requestId) {
          setData(response)
        }
      })
      .catch((err: unknown) => {
        if (isMountedRef.current && requestIdRef.current === requestId) {
          setError(err instanceof Error ? err.message : 'Error desconocido al cargar analytics')
        }
      })
      .finally(() => {
        if (isMountedRef.current && requestIdRef.current === requestId) {
          setLoading(false)
        }
      })
  }, [])

  return {
    data,
    loading,
    error,
    refetch
  }
}
