// Adapters to convert analytics data to base component formats
import { SupplierAnalytics, ProductAnalytics } from "../../../../../types/Analytics";

// Single Responsibility: Convert supplier analytics to ranking items
export const supplierToRankingItems = (suppliers: SupplierAnalytics[]) => {
  return suppliers.map(supplier => ({
    id: supplier.personId,
    name: supplier.personName,
    primaryValue: supplier.totalWeight,
    secondaryValue: supplier.transactionCount,
    primaryLabel: "kg",
    secondaryLabel: "transacciones"
  }));
};

// Single Responsibility: Convert product analytics to ranking items
export const productToRankingItems = (products: ProductAnalytics[]) => {
  return products.map(product => ({
    id: product.productId,
    name: product.productName,
    primaryValue: product.totalWeight,
    secondaryValue: product.transactionCount,
    primaryLabel: "kg",
    secondaryLabel: "transacciones"
  }));
};

// Single Responsibility: Format weight values
export const formatWeight = (value: number): string => {
  return value.toFixed(2);
};

// Single Responsibility: Format percentage values
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Single Responsibility: Calculate insights from analytics data
export const calculateInsights = (
  totalSuppliers: number,
  totalWeight: number,
  totalTransactions: number,
  topSuppliers: SupplierAnalytics[],
  bottomSuppliers: SupplierAnalytics[],
  topProducts: ProductAnalytics[]
) => {
  const avgWeightPerSupplier = totalSuppliers > 0 ? totalWeight / totalSuppliers : 0;
  const avgTransactionsPerSupplier = totalSuppliers > 0 ? totalTransactions / totalSuppliers : 0;
  const topSupplierWeight = topSuppliers[0]?.totalWeight || 0;
  const bottomSupplierWeight = bottomSuppliers[0]?.totalWeight || 0;
  const weightGap = topSupplierWeight - bottomSupplierWeight;

  return {
    avgWeightPerSupplier,
    avgTransactionsPerSupplier,
    weightGap,
    topSupplier: topSuppliers[0],
    topProduct: topProducts[0]
  };
};
