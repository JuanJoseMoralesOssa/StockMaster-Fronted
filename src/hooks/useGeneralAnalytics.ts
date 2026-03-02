import { useState, useEffect } from 'react'
import { analyticsService } from '../services/AnalyticsService'
import {
  DashboardSummaryResponse,
  AnalyticsFilters
} from '../types/Analytics'

interface UseAnalyticsReturn {
  data: DashboardSummaryResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useGeneralAnalytics = (filters: AnalyticsFilters): UseAnalyticsReturn => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!filters.startDate || !filters.endDate) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ahora es una única petición de red
      const response = await analyticsService.getDashboardSummary({
        ...filters,
        limit: filters.limit || 10
      })

      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters.startDate, filters.endDate, filters.type, filters.limit])

  const refetch = () => {
    fetchAnalytics()
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}
