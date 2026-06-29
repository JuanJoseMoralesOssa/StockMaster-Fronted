// Adapters to convert analytics data to base component formats
import { SupplierAnalytics, ProductAnalytics } from "../../../../../types/Analytics";
import { formatKg } from "@/utils/format";

// Single Responsibility: Convert supplier analytics to ranking items
export const supplierToRankingItems = (suppliers: SupplierAnalytics[]) => {
  return suppliers.map(supplier => ({
    id: supplier.personId,
    name: supplier.personName,
    primaryValue: supplier.totalWeight,
    purchaseValue: supplier.purchaseWeight,
    paymentValue: supplier.paymentWeight,
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
    purchaseValue: product.purchaseWeight,
    paymentValue: product.paymentWeight,
    secondaryValue: product.transactionCount,
    primaryLabel: "kg",
    secondaryLabel: "transacciones"
  }));
};

// Single Responsibility: Format weight values (punto decimal, sin ceros sobrantes)
export const formatWeight = (value: number): string => {
  return formatKg(value);
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
