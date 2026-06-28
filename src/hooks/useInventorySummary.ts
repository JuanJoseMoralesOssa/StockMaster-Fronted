import { useCallback, useEffect, useState } from 'react'
import { analyticsService } from '../services/AnalyticsService'
import { InventorySummaryResponse } from '../types/Analytics'

interface UseInventorySummaryReturn {
  data: InventorySummaryResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Loads the current inventory snapshot (total balance, low/out-of-balance counts).
 * This is a point-in-time value, independent of the dashboard date filters.
 */
export const useInventorySummary = (
  lowBalanceThreshold?: number,
): UseInventorySummaryReturn => {
  const [data, setData] = useState<InventorySummaryResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await analyticsService.getInventorySummary(lowBalanceThreshold)
      setData(response)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error desconocido al cargar el inventario',
      )
      console.error('Error fetching inventory summary:', err)
    } finally {
      setLoading(false)
    }
  }, [lowBalanceThreshold])

  useEffect(() => {
    // Fetch on mount / when the fetcher changes. The setState inside is the
    // intentional loading transition of an async request, not a sync cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory()
  }, [fetchInventory])

  return { data, loading, error, refetch: fetchInventory }
}
