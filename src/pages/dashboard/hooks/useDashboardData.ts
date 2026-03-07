import { useState, useEffect, useCallback } from 'react'
import { useProductStore } from '../../../stores/useProductStore'
import { useSupplierStore } from '../../../stores/useSupplierStore'
import { dashboardService } from '../../../services/DashboardService'
import { DashboardResult, ProductsResults, SuppliersResults } from '../../../types/DashboardResults'
import { useDashboardAnalytics } from '../../../hooks/useDashboardAnalytics'
import { getCurrentMonthRange, getPrevMonthRange } from '../utils/dateHelpers'

export interface DashboardFilters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

type SelectedFilter = 'all' | 'withDebt' | 'fullyPaid'

const defaultRange = getCurrentMonthRange()

export function useDashboardData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [supplierProductResults, setSupplierProductResults] = useState<DashboardResult[]>([])
  const [suppliersResults, setSuppliersResults] = useState<SuppliersResults[]>([])
  const [productsResults, setProductsResults] = useState<ProductsResults[]>([])
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>('all')

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

  // Analytics for the selected period
  const analytics = useDashboardAnalytics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: 'both',
  })

  // Analytics for the previous calendar month (auto-computed)
  const prevRange = getPrevMonthRange(filters.startDate)
  const prevAnalytics = useDashboardAnalytics({
    startDate: prevRange.startDate,
    endDate: prevRange.endDate,
    type: 'both',
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
          .catch(err => {
            console.error('Error fetching person product transactions:', err)
            setError('Error al cargar los datos de transacciones de proveedor y producto')
          })
      }
      if (filters.supplierId && !filters.productId) {
        await dashboardService
          .getPersonTransactions(Number(filters.supplierId), filters.startDate, filters.endDate)
          .then(data => setProductsResults([...data]))
          .catch(err => {
            console.error('Error fetching person transactions:', err)
            setError('Error al cargar los datos de transacciones de proveedor')
          })
      }
      if (!filters.supplierId && filters.productId) {
        await dashboardService
          .getProductTransactions(Number(filters.productId), filters.startDate, filters.endDate)
          .then(data => setSuppliersResults([...data]))
          .catch(err => {
            console.error('Error fetching product transactions:', err)
            setError('Error al cargar los datos de transacciones de producto')
          })
      }

      // Refresh analytics (current + previous month)
      analytics.refetch({ startDate: filters.startDate, endDate: filters.endDate, type: 'both' })
      const prev = getPrevMonthRange(filters.startDate)
      prevAnalytics.refetch({ startDate: prev.startDate, endDate: prev.endDate, type: 'both' })

      setLoading(false)
    } catch (err) {
      console.error('Error fetching supplier payment data:', err)
      setError('Error al cargar los datos de pagos')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, clearResults])

  return {
    // state
    loading,
    error,
    filters,
    selectedFilter,
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
    fetchData,
    resetFilters,
    clearResults,
  }
}
