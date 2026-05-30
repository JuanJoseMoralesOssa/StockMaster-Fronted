import { DashboardResult, ProductsResults, SuppliersResults } from "../../types/DashboardResults"
import Person from "../../types/Person"
import Product from "../../types/Product"
import { DashboardSummaryResponse } from "../../types/Analytics"
import DetailedDashboard from "./Detailed/DetailedDashboard"
import GeneralDashboard from "./General/GeneralDashboard"

interface RenderingWithModeProps {
  dashboardMode: 'detailed' | 'general'
  filters: {
    startDate: string
    endDate: string
    supplierId: string
    productId: string
  }
  products: Partial<Product>[]
  suppliers: Person[]
  suppliersResults: SuppliersResults[]
  productsResults: ProductsResults[]
  supplierProductResults: DashboardResult[]
  selectedFilter: 'all' | 'withDebt' | 'fullyPaid'
  analyticsData?: DashboardSummaryResponse | null
  analyticsLoading?: boolean
  analyticsError?: string | null
  onAnalyticsRetry?: () => void
}

function RenderingWithMode(
  {
    dashboardMode,
    filters,
    products,
    suppliers,
    suppliersResults,
    productsResults,
    supplierProductResults,
    selectedFilter,
    analyticsData,
    analyticsLoading,
    analyticsError,
    onAnalyticsRetry
  }: Readonly<RenderingWithModeProps>,
) {
  return (
    <>
      {dashboardMode === 'detailed' && (
        <DetailedDashboard
          filters={filters}
          products={products}
          suppliers={suppliers}
          suppliersResults={suppliersResults}
          productsResults={productsResults}
          supplierProductResults={supplierProductResults}
          selectedFilter={selectedFilter}
        />
      )}

      {dashboardMode === 'general' && (
        <GeneralDashboard
          analyticsData={analyticsData}
          analyticsLoading={analyticsLoading}
          analyticsError={analyticsError}
          onRetry={onAnalyticsRetry}
        />
      )}
    </>
  )
}

export default RenderingWithMode
