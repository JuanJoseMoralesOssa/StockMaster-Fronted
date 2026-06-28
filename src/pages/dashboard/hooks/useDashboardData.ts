import { useState, useEffect, useCallback } from 'react'
import { useProductStore } from '../../../stores/useProductStore'
import { useSupplierStore } from '../../../stores/useSupplierStore'
import { dashboardService } from '../../../services/DashboardService'
import { DashboardResult, PersonReportRow, ProductReportRow } from '../../../types/DashboardResults'
import { useDashboardAnalytics } from '../../../hooks/useDashboardAnalytics'
import { getCurrentMonthRange, getPreviousPeriodRange } from '../utils/dateHelpers'

export interface DashboardFilters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

export type SelectedFilter = 'all' | 'withDebt' | 'fullyPaid'
export type SummaryType = 'both' | 'purchases' | 'payments'

export function useDashboardData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [supplierProductResults, setSupplierProductResults] = useState<DashboardResult[]>([])
  const [suppliersResults, setSuppliersResults] = useState<ProductReportRow[]>([])
  const [productsResults, setProductsResults] = useState<PersonReportRow[]>([])
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>('all')
  const [summaryType, setSummaryType] = useState<SummaryType>('both')

  // El rango por defecto se calcula al montar (no al cargar el módulo) para que
  // una pestaña abierta varios días no arrastre un "mes actual" desactualizado.
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    const range = getCurrentMonthRange()
    return {
      startDate: range.startDate,
      endDate: range.endDate,
      supplierId: '',
      productId: '',
    }
  })

  // Zustand store selectors
  const products = useProductStore(state => state.products)
  const suppliers = useSupplierStore(state => state.suppliers)
  const fetchProducts = useProductStore(state => state.fetchProducts)
  const fetchSuppliers = useSupplierStore(state => state.fetchSuppliers)

  // Analytics for the selected period and type
  const analytics = useDashboardAnalytics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: summaryType,
  })

  // Analytics for the immediately-preceding period of the SAME length (for deltas)
  const prevRange = getPreviousPeriodRange(filters.startDate, filters.endDate)
  const prevAnalytics = useDashboardAnalytics({
    startDate: prevRange.startDate,
    endDate: prevRange.endDate,
    type: summaryType,
  })

  // `refetch` es estable (useCallback con deps vacías en useDashboardAnalytics),
  // así que puede usarse en dependencias sin recrear efectos ni callbacks.
  const { refetch: refetchAnalytics } = analytics
  const { refetch: refetchPrevAnalytics } = prevAnalytics

  // Bootstrap: load stores + initial analytics (runs once — all deps are stable)
  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
    refetchAnalytics()
    refetchPrevAnalytics()
  }, [fetchProducts, fetchSuppliers, refetchAnalytics, refetchPrevAnalytics])

  // ---------- helpers ----------

  const clearResults = useCallback(() => {
    setSupplierProductResults([])
    setSuppliersResults([])
    setProductsResults([])
  }, [])

  const resetFilters = useCallback(() => {
    const range = getCurrentMonthRange()
    setFilters({
      startDate: range.startDate,
      endDate: range.endDate,
      supplierId: '',
      productId: '',
    })
    setSelectedFilter('all')
    clearResults()
  }, [clearResults])

  // ---------- data fetch ----------

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    clearResults()

    try {
      if (!filters.startDate || !filters.endDate) {
        setError('Por favor, selecciona un rango de fechas válido.')
        return
      }
      if (filters.startDate > filters.endDate) {
        setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
        return
      }
      const daysDiff = Math.ceil(
        (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
      if (daysDiff > 365) {
        setError('El rango de fechas no puede superar 365 días.')
        return
      }
      if (filters.supplierId && isNaN(Number(filters.supplierId))) {
        setError('Por favor, selecciona un proveedor válido.')
        return
      }
      if (filters.productId && isNaN(Number(filters.productId))) {
        setError('Por favor, selecciona un producto válido.')
        return
      }

      // Fetch detailed results based on the filter combination
      if (filters.supplierId && filters.productId) {
        try {
          const data = await dashboardService.getPersonProductTransactions(
            Number(filters.supplierId),
            Number(filters.productId),
            filters.startDate,
            filters.endDate,
          )
          setSupplierProductResults([...data])
        } catch {
          setError('Error al cargar los datos de transacciones de proveedor y producto')
        }
      } else if (filters.supplierId) {
        try {
          const data = await dashboardService.getPersonTransactions(
            Number(filters.supplierId),
            filters.startDate,
            filters.endDate,
          )
          setProductsResults([...data])
        } catch {
          setError('Error al cargar los datos de transacciones de proveedor')
        }
      } else if (filters.productId) {
        try {
          const data = await dashboardService.getProductTransactions(
            Number(filters.productId),
            filters.startDate,
            filters.endDate,
          )
          setSuppliersResults([...data])
        } catch {
          setError('Error al cargar los datos de transacciones de producto')
        }
      }

      // Refresh analytics (current period + previous same-length period)
      refetchAnalytics({ startDate: filters.startDate, endDate: filters.endDate, type: summaryType })
      const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
      refetchPrevAnalytics({ startDate: prev.startDate, endDate: prev.endDate, type: summaryType })
    } finally {
      setLoading(false)
    }
  }, [filters, summaryType, clearResults, refetchAnalytics, refetchPrevAnalytics])

  // Cambiar el tipo (Compras/Pagos/Ambos) refresca los KPIs al instante.
  const changeSummaryType = useCallback(
    (type: SummaryType) => {
      setSummaryType(type)
      if (filters.startDate && filters.endDate) {
        refetchAnalytics({ startDate: filters.startDate, endDate: filters.endDate, type })
        const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
        refetchPrevAnalytics({ startDate: prev.startDate, endDate: prev.endDate, type })
      }
    },
    [filters.startDate, filters.endDate, refetchAnalytics, refetchPrevAnalytics],
  )

  return {
    // state
    loading,
    error,
    filters,
    selectedFilter,
    summaryType,
    products,
    suppliers,
    supplierProductResults,
    suppliersResults,
    productsResults,
    analytics,
    prevAnalytics,

    // actions
    setFilters,
    setSelectedFilter: (f: string) => setSelectedFilter(f as SelectedFilter),
    changeSummaryType,
    fetchData,
    resetFilters,
    clearResults,
  }
}
