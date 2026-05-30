/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import Purchase from '../types/Purchase'
import PurchaseDetails from '../types/PurchaseDetails'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../utils/date'
import { purchaseService } from '../services/PurchaseService'
import PurchaseCreate from '../pages/purchase/components/PurchaseCreate'
import PurchaseEditForm from '../pages/purchase/components/PurchaseEditForm'
import PurchaseFilters from '../pages/purchase/components/PurchaseFilters'
import ScanFormButton from '../pages/purchase/components/ScanFormButton'
import { buildDocumentPageConfig } from './documentPageConfig'
import { useProductStore, useSupplierStore } from '../stores'
import DocumentFiltersChrome from '../pages/components/common/DocumentFiltersChrome'
import DocumentDetailsExpandedView from '../pages/components/common/DocumentDetailsExpandedView'

function PurchaseExpandedDetails({ purchase }: Readonly<{ purchase: Purchase }>) {
  const { products, fetchProducts } = useProductStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  return (
    <DocumentDetailsExpandedView<PurchaseDetails>
      details={purchase.purchase_details ?? []}
      products={products}
      suppliers={suppliers}
    />
  )
}

function PurchaseFiltersSection({
  filters,
  setFilters,
  onSearch,
  onClear,
  loading,
}: Readonly<{
  filters: DateRangeFilters
  setFilters: (filters: DateRangeFilters) => void
  onSearch: () => void
  onClear: () => void
  loading: boolean
}>) {
  const products = useProductStore((state) => state.products)
  const suppliers = useSupplierStore((state) => state.suppliers)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  return (
    <DocumentFiltersChrome onSearch={onSearch} onClear={onClear} loading={loading}>
      <PurchaseFilters
        filters={filters}
        setFilters={setFilters}
        products={products}
        suppliers={suppliers}
        loading={loading}
      />
    </DocumentFiltersChrome>
  )
}

const basePurchasePageConfig = buildDocumentPageConfig<
  Purchase,
  PurchaseDetails,
  DateRangeFilters,
  'purchase_details'
>(
  {
    service: {
      getAllPaginated: (page: number, limit: number) => purchaseService.getAllPaginatedWithDetails(page, limit),
      create: (data) => purchaseService.create(data),
      update: (id, data) => purchaseService.update(id, data),
      updatePartial: (id, data) => purchaseService.updatePartial(id, data),
      delete: (id) => purchaseService.delete(id),
      getAllPaginatedFiltered: (filters, page, limit) => purchaseService.getAllPaginatedFiltered(filters, page, limit),
    },
    entityName: 'Compra',
    entityNamePlural: 'Compras',
    detailsKey: 'purchase_details',
    fetchForEdit: (id) => purchaseService.getByIdWithDetails(id as number),
    renderExpandedDetails: (item) => <PurchaseExpandedDetails purchase={item} />,
    renderFilters: ({ filters, setFilters, onSearch, onClear, loading }) => (
      <PurchaseFiltersSection
        filters={filters}
        setFilters={setFilters}
        onSearch={onSearch}
        onClear={onClear}
        loading={loading}
      />
    ),
    renderCreateForm: (onSuccess, onItemCreated) => (
      <PurchaseCreate onSuccess={onSuccess} onPurchaseCreated={onItemCreated} />
    ),
    renderEditForm: (item, onSuccess, onItemUpdated) => (
      <PurchaseEditForm key={item.id} purchase={item} onSuccess={onSuccess} onItemUpdated={onItemUpdated} />
    ),
  },
  buildInitialDateRangeFilters(),
)

export const purchasePageConfig = {
  ...basePurchasePageConfig,
  renderHeaderActions: () => <ScanFormButton />,
}
