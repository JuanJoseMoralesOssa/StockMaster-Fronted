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
  /** Number of expense documents ("Gasto") in the range. */
  expenseCount: number
  /** Total weight ordered (purchases / "Compra") in the range. */
  totalPurchaseWeight: number
  /** Total weight paid/delivered (expenses / "Gasto") in the range. */
  totalExpenseWeight: number
  /** Outstanding weight: purchases minus expenses. */
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
  type?: 'purchases' | 'expenses' | 'both'
  limit?: number
}

export interface LowStockProduct {
  productId: number
  productName: string
  stock: number
}

export interface InventorySummaryResponse {
  /** Sum of current stock (kg) across all products. */
  totalStock: number
  productCount: number
  inStockCount: number
  outOfStockCount: number
  /** Products with 0 < stock <= lowStockThreshold. */
  lowStockCount: number
  lowStockThreshold: number
  lowStockProducts: LowStockProduct[]
}
