import { DashboardResult, ProductsResults, SuppliersResults } from "../../types/DashboardResults";
import DetailedDashboard from "./Detailed/DetailedDashboard"
import GeneralDashboard from "./General/GeneralDashboard"

interface RenderingWithModeProps {
  dashboardMode: 'detailed' | 'general';
  filters: {
    startDate: string;
    endDate: string;
    supplierId: string;
    productId: string;
  };
  products: { id: number; name: string }[];
  availableSuppliers: { id: number; name: string }[];
  suppliersResults: SuppliersResults[];
  productsResults: ProductsResults[];
  supplierProductResults: DashboardResult[];
  selectedFilter: 'all' | 'withDebt' | 'fullyPaid';
}

function RenderingWithMode(
  {
    dashboardMode,
    filters,
    products,
    availableSuppliers,
    suppliersResults,
    productsResults,
    supplierProductResults,
    selectedFilter,
  }: Readonly<RenderingWithModeProps>,
) {
  return (
    <>
      {dashboardMode === 'detailed' && (
        <DetailedDashboard
          filters={filters}
          products={products.filter(p => typeof p.id === 'number').map(p => ({ id: p.id as number, name: p.name }))}
          availableSuppliers={availableSuppliers.filter(s => typeof s.id === 'number' && s.id !== undefined).map(s => ({ id: s.id as number, name: s.name }))}
          suppliersResults={suppliersResults}
          productsResults={productsResults}
          supplierProductResults={supplierProductResults}
          selectedFilter={selectedFilter}
        />
      )}

      {dashboardMode === 'general' && (
        <GeneralDashboard
          supplierProductResults={supplierProductResults}
          productsResults={productsResults}
          suppliersResults={suppliersResults}
          filters={filters}
          availableSuppliers={availableSuppliers.filter(s => typeof s.id === 'number' && s.id !== undefined).map(s => ({ id: s.id as number, name: s.name }))}
          products={products.filter(p => typeof p.id === 'number').map(p => ({ id: p.id as number, name: p.name }))}
        />
      )}
    </>
  )
}

export default RenderingWithMode
