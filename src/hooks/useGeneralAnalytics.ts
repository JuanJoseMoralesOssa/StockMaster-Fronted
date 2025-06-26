import { useState, useEffect } from 'react';
import { analyticsService } from '../services/AnalyticsService';
import {
  DateRangeAnalytics,
  SupplierAnalytics,
  ProductAnalytics,
  AnalyticsFilters
} from '../types/Analytics';

interface UseAnalyticsReturn {
  dateRangeAnalytics: DateRangeAnalytics | null;
  topSuppliers: SupplierAnalytics[];
  topProducts: ProductAnalytics[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGeneralAnalytics = (filters: AnalyticsFilters): UseAnalyticsReturn => {
  const [dateRangeAnalytics, setDateRangeAnalytics] = useState<DateRangeAnalytics | null>(null);
  const [topSuppliers, setTopSuppliers] = useState<SupplierAnalytics[]>([]);
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!filters.startDate || !filters.endDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [dateRange, suppliers, products] = await Promise.all([
        analyticsService.getDateRangeAnalytics(filters),
        analyticsService.getTopSuppliers({ ...filters, limit: 10 }),
        analyticsService.getTopProducts({ ...filters, limit: 10 })
      ]);

      setDateRangeAnalytics(dateRange);
      setTopSuppliers(suppliers);
      setTopProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.startDate, filters.endDate, filters.type]);

  const refetch = () => {
    fetchAnalytics();
  };

  return {
    dateRangeAnalytics,
    topSuppliers,
    topProducts,
    loading,
    error,
    refetch
  };
};
