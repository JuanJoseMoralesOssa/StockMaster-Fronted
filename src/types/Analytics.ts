export interface SupplierAnalytics {
  personId: number;
  personName: string;
  totalWeight: number;
  transactionCount: number;
}

export interface ProductAnalytics {
  productId: number;
  productName: string;
  totalWeight: number;
  transactionCount: number;
}

export interface DateRangeAnalytics {
  topSuppliers: SupplierAnalytics[];
  bottomSuppliers: SupplierAnalytics[];
  topProducts: ProductAnalytics[];
  bottomProducts: ProductAnalytics[];
  summary: {
    totalSuppliers: number;
    totalProducts: number;
    totalWeight: number;
    totalTransactions: number;
  };
}

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  type?: 'purchases' | 'expenses' | 'both';
  limit?: number;
}
