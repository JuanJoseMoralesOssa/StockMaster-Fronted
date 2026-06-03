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

type SelectedFilter = 'all' | 'withDebt' | 'fullyPaid'
export type SummaryType = 'both' | 'purchases' | 'expenses'

const defaultRange = getCurrentMonthRange()

export function useDashboardData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [supplierProductResults, setSupplierProductResults] = useState<DashboardResult[]>([])
  const [suppliersResults, setSuppliersResults] = useState<ProductReportRow[]>([])
  const [productsResults, setProductsResults] = useState<PersonReportRow[]>([])
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>('all')
  const [summaryType, setSummaryType] = useState<SummaryType>('both')

  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
    supplierId: '',
    productId: '',
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

  // Bootstrap: load stores + initial analytics
  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
    analytics.refetch()
    prevAnalytics.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts, fetchSuppliers])

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
    try {
      setLoading(true)
      setError(null)
      clearResults()

      if (!filters.startDate || !filters.endDate) {
        setError('Por favor, selecciona un rango de fechas válido.')
        setLoading(false)
        return
      }
      if (filters.startDate > filters.endDate) {
        setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
        setLoading(false)
        return
      }
      if (filters.supplierId && isNaN(Number(filters.supplierId))) {
        setError('Por favor, selecciona un proveedor válido.')
        setLoading(false)
        return
      }
      if (filters.productId && isNaN(Number(filters.productId))) {
        setError('Por favor, selecciona un producto válido.')
        setLoading(false)
        return
      }

      // Fetch detailed results based on the filter combination
      if (filters.supplierId && filters.productId) {
        await dashboardService
          .getPersonProductTransactions(
            Number(filters.supplierId),
            Number(filters.productId),
            filters.startDate,
            filters.endDate,
          )
          .then(data => setSupplierProductResults([...data]))
          .catch(() => {
            setError('Error al cargar los datos de transacciones de proveedor y producto')
          })
      }
      if (filters.supplierId && !filters.productId) {
        await dashboardService
          .getPersonTransactions(Number(filters.supplierId), filters.startDate, filters.endDate)
          .then(data => setProductsResults([...data]))
          .catch(() => {
            setError('Error al cargar los datos de transacciones de proveedor')
          })
      }
      if (!filters.supplierId && filters.productId) {
        await dashboardService
          .getProductTransactions(Number(filters.productId), filters.startDate, filters.endDate)
          .then(data => setSuppliersResults([...data]))
          .catch(() => {
            setError('Error al cargar los datos de transacciones de producto')
          })
      }

      // Refresh analytics (current period + previous same-length period)
      analytics.refetch({ startDate: filters.startDate, endDate: filters.endDate, type: summaryType })
      const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
      prevAnalytics.refetch({ startDate: prev.startDate, endDate: prev.endDate, type: summaryType })

      setLoading(false)
    } catch {
      setError('Error al cargar los datos de pagos')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, clearResults])

  // Cambiar el tipo (Compras/Gastos/Ambos) refresca los KPIs al instante.
  const changeSummaryType = useCallback(
    (type: SummaryType) => {
      setSummaryType(type)
      if (filters.startDate && filters.endDate) {
        analytics.refetch({ startDate: filters.startDate, endDate: filters.endDate, type })
        const prev = getPreviousPeriodRange(filters.startDate, filters.endDate)
        prevAnalytics.refetch({ startDate: prev.startDate, endDate: prev.endDate, type })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.startDate, filters.endDate],
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
