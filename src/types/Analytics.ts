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

export interface AnalyticsSummary {
  totalSuppliers: number
  totalProducts: number
  totalWeight: number
  /** Number of detail lines (each product line within a document). */
  totalTransactions: number
  /** Number of purchase documents ("Compra") in the range. */
  purchaseCount: number
  /** Number of payment documents ("Pago") in the range. */
  paymentCount: number
  /** Total weight ordered (purchases / "Compra") in the range. */
  totalPurchaseWeight: number
  /** Total weight paid/delivered (payments / "Pago") in the range. */
  totalPaymentWeight: number
  /** Outstanding weight: purchases minus payments. */
  pendingWeight: number
}

export interface DashboardSummaryResponse {
  summary: AnalyticsSummary
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
  type?: 'purchases' | 'payments' | 'both'
  limit?: number
}

export interface LowBalanceProduct {
  productId: number
  productName: string
  balance: number
}

export interface InventorySummaryResponse {
  /** Sum of current balance (kg) across all products. */
  totalBalance: number
  productCount: number
  inBalanceCount: number
  outOfBalanceCount: number
  /** Products with 0 < balance <= lowBalanceThreshold. */
  lowBalanceCount: number
  lowBalanceThreshold: number
  lowBalanceProducts: LowBalanceProduct[]
}
