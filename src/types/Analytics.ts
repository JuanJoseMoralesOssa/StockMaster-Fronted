export interface SupplierAnalytics {
  personId: number
  personName: string
  /** Compras + pagos combinados (para ordenar / compatibilidad). */
  totalWeight: number
  /** Peso comprado a este proveedor (entradas / "Compra"). */
  purchaseWeight: number
  /** Peso pagado a este proveedor (salidas / "Pago"). */
  paymentWeight: number
  transactionCount: number
}

export interface ProductAnalytics {
  productId: number
  productName: string
  /** Compras + pagos combinados (para ordenar / compatibilidad). */
  totalWeight: number
  /** Peso comprado de este producto (entradas / "Compra"). */
  purchaseWeight: number
  /** Peso pagado de este producto (salidas / "Pago"). */
  paymentWeight: number
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

export type PendingTrendInterval = 'day' | 'week' | 'month'

/** Un punto de la serie de pendiente en el tiempo (saldo absoluto). */
export interface PendingTrendPoint {
  period: string
  purchased: number
  paid: number
  pending: number
}

/** Pendiente (comprado − pagado) por proveedor, en kg. */
export interface PendingBySupplier {
  personId: number
  personName: string
  purchased: number
  paid: number
  pending: number
}

/** Pendiente actual por producto + desde cuándo lo arrastra. */
export interface PendingByProduct {
  productId: number
  productName: string
  balance: number
  /** Fecha ISO desde la que el balance está pendiente; null si se desconoce. */
  pendingSince: string | null
}
