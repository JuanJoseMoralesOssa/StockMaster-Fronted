import { useCallback, useEffect, useState } from 'react'
import { analyticsService } from '../services/AnalyticsService'
import {
  PendingByProduct,
  PendingBySupplier,
  PendingTrendInterval,
  PendingTrendPoint,
} from '../types/Analytics'

// El backend rechaza rangos > 365 días (validateDateRange). La tendencia se
// acota a ese último año para no fallar; las listas son punto-en-el-tiempo.
const MAX_TREND_DAYS = 365

export const dayDiff = (start: string, end: string): number => {
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000)
}

const pad = (n: number): string => String(n).padStart(2, '0')

/** Acota el inicio de la tendencia a <=365 días antes del fin (evita 422). */
export const clampTrendStart = (start: string, end: string): string => {
  if (dayDiff(start, end) <= MAX_TREND_DAYS) return start
  const [ey, em, ed] = end.split('-').map(Number)
  const c = new Date(Date.UTC(ey, em - 1, ed) - MAX_TREND_DAYS * 86400000)
  return `${c.getUTCFullYear()}-${pad(c.getUTCMonth() + 1)}-${pad(c.getUTCDate())}`
}

/** Bucket adaptativo: día para rangos cortos, semana/mes para los largos. */
export const pickInterval = (start: string, end: string): PendingTrendInterval => {
  const days = dayDiff(start, end)
  if (days > 92) return 'month'
  if (days > 31) return 'week'
  return 'day'
}

interface UseDashboardInsightsReturn {
  trend: PendingTrendPoint[]
  bySupplier: PendingBySupplier[]
  byProduct: PendingByProduct[]
  interval: PendingTrendInterval
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Insights de pendiente: tendencia en el tiempo (con los filtros de fecha),
 * pendiente por proveedor y por producto + antigüedad (punto en el tiempo).
 */
export function useDashboardInsights(
  startDate: string,
  endDate: string,
): UseDashboardInsightsReturn {
  const [trend, setTrend] = useState<PendingTrendPoint[]>([])
  const [bySupplier, setBySupplier] = useState<PendingBySupplier[]>([])
  const [byProduct, setByProduct] = useState<PendingByProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  // El bucket que corresponde a la tendencia ACTUALMENTE mostrada. Se actualiza
  // junto con `trend` cuando el fetch resuelve (no se deriva de props), para que el
  // eje no formatee períodos viejos con un bucket nuevo durante el refetch.
  const [interval, setIntervalState] = useState<PendingTrendInterval>('day')

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    if (!startDate || !endDate) return
    // `ignore` evita que una respuesta vieja (cambio rápido de fechas) pise a una
    // más nueva o apague `loading` antes de tiempo.
    let ignore = false
    const trendStart = clampTrendStart(startDate, endDate)
    const chosen = pickInterval(trendStart, endDate)
    // Transición de carga intencional al cambiar el rango (no es un cascade).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */

    // La tendencia depende del rango y puede fallar; su error NO debe vaciar las
    // listas (que son independientes del rango), así que se aísla.
    const trendPromise = analyticsService
      .getPendingTrend(trendStart, endDate, chosen)
      .catch((): PendingTrendPoint[] => [])

    Promise.all([
      trendPromise,
      analyticsService.getPendingBySupplier(8),
      analyticsService.getPendingByProduct(8),
    ])
      .then(([t, s, p]) => {
        if (ignore) return
        setTrend(t)
        setIntervalState(chosen)
        setBySupplier(s)
        setByProduct(p)
      })
      .catch((err) => {
        if (ignore) return
        setError(err instanceof Error ? err.message : 'Error al cargar los insights de pendiente')
        console.error('Error fetching pending insights:', err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [startDate, endDate, reloadToken])

  return { trend, bySupplier, byProduct, interval, loading, error, refetch }
}
