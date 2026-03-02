export interface SupplierAnalytics {
  personId: number
  personName: string
  totalWeight: number
  transactionCount: number
}

export interface ProductAnalytics {
  productId: number
  productName: string
  totalWeight: number
  transactionCount: number
}

export interface DashboardSummaryResponse {
  summary: {
    totalSuppliers: number
    totalProducts: number
    totalWeight: number
    totalTransactions: number
  }
  topSuppliersByWeight: SupplierAnalytics[]
  bottomSuppliersByWeight: SupplierAnalytics[]
  topProductsByWeight: ProductAnalytics[]
  bottomProductsByWeight: ProductAnalytics[]
  mostActiveSuppliers: SupplierAnalytics[]
  mostTransactedProducts: ProductAnalytics[]
}

export interface AnalyticsFilters {
  startDate: string
  endDate: string
  type?: 'purchases' | 'expenses' | 'both'
  limit?: number
}
