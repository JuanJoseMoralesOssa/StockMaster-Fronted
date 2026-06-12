import SupplierProductCharts from './SupplierProductCharts'
import SupplierCharts from './SupplierCharts'
import ProductChart from './ProductChart'
import type Person from '../../../types/Person'
import { ErrorBoundary } from '../../../components/ErrorBoundary'
import { useDashboard } from '../DashboardContext'

function DetailedDashboard() {
  const {
    filters,
    products,
    suppliers,
    suppliersResults,
    productsResults,
    supplierProductResults,
    selectedFilter,
  } = useDashboard()

  return (
    <section className="flex flex-col gap-4">
      {filters.supplierId &&
        filters.productId &&
        supplierProductResults.length > 0 && (
          <ErrorBoundary key={`supplier-product-${filters.supplierId}-${filters.productId}`}>
            <SupplierProductCharts
              key={`supplier-product-${filters.supplierId}-${filters.productId}-${filters.startDate}-${filters.endDate}`}
              results={supplierProductResults}
              supplier={suppliers.find(s => s.id === Number(filters.supplierId)) ?? {} as Person}
              product={{
                id: products.find(p => p.id === Number(filters.productId))?.id ?? 0,
                name: products.find(p => p.id === Number(filters.productId))?.name ?? 'Unknown Product',
              }}
              filters={filters}
              selectedFilter={selectedFilter}
            />
          </ErrorBoundary>
        )}

      {filters.supplierId &&
        !filters.productId &&
        productsResults.length > 0 && (
          <ErrorBoundary key={`supplier-${filters.supplierId}`}>
            <SupplierCharts
              key={`supplier-${filters.supplierId}-${filters.startDate}-${filters.endDate}`}
              results={productsResults}
              products={products}
              filters={filters}
            />
          </ErrorBoundary>
        )}

      {!filters.supplierId &&
        filters.productId &&
        suppliersResults.length > 0 && (
          <ErrorBoundary key={`product-${filters.productId}`}>
            <ProductChart
              key={`product-${filters.productId}-${filters.startDate}-${filters.endDate}`}
              results={suppliersResults}
              suppliers={suppliers}
              filters={filters}
            />
          </ErrorBoundary>
        )}
    </section>
  )
}

export default DetailedDashboard
