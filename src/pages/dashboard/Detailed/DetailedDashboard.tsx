import SupplierProductCharts from './SupplierProductCharts';
import SupplierCharts from './SupplierCharts';
import ProductChart from './ProductChart';
import Person from '../../../types/Person';
import { DashboardResult, ProductsResults, SuppliersResults } from '../../../types/DashboardResults';
import Product from '../../../types/Product';

interface DetailedDashboardProps {
  filters: {
    supplierId: string;
    productId: string;
    startDate: string;
    endDate: string;
  };
  products: Partial<Product>[];
  suppliers: Person[];
  suppliersResults: SuppliersResults[];
  productsResults: ProductsResults[];
  supplierProductResults: DashboardResult[];
  selectedFilter: 'all' | 'withDebt' | 'fullyPaid';
}

function DetailedDashboard(
  {
    filters,
    products,
    suppliers,
    suppliersResults,
    productsResults,
    supplierProductResults,
    selectedFilter
  }: Readonly<DetailedDashboardProps>
) {
  return (
    <section className="flex flex-col gap-4 ">
      {filters.supplierId &&
        filters.productId &&
        supplierProductResults.length > 0 &&
        (
          <SupplierProductCharts
            key={`supplier-product-${filters.supplierId}-${filters.productId}-${filters.startDate}-${filters.endDate}`}
            results={supplierProductResults}
            supplier={suppliers.find(s => s.id === Number(filters.supplierId)) ?? {} as Person}
            product={{
              id: products.find(p => p.id === Number(filters.productId))?.id ?? 0,
              name: products.find(p => p.id === Number(filters.productId))?.name ?? 'Unknown Product',
            }}
            filters={filters}
            selectedFilter={selectedFilter} />
        )
      }

      {filters.supplierId &&
        !filters.productId &&
        productsResults.length > 0 &&
        (
          <SupplierCharts
            key={`supplier-${filters.supplierId}-${filters.startDate}-${filters.endDate}`}
            selectedFilter={selectedFilter}
            results={productsResults}
            products={products}
            filters={filters}
          />
        )
      }

      {!filters.supplierId &&
        filters.productId &&
        suppliersResults.length > 0 &&
        (
          <ProductChart
            key={`product-${filters.productId}-${filters.startDate}-${filters.endDate}`}
            selectedFilter="all"
            results={suppliersResults}
            suppliers={suppliers}
            filters={filters}
          />
        )
      }

    </section>
  )
}

export default DetailedDashboard
