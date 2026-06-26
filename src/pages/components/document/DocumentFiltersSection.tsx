import { useEffect } from 'react'
import Autocomplete from '@/pages/components/common/Autocomplete'
import DocumentFiltersChrome from '@/pages/components/common/DocumentFiltersChrome'
import { Button } from '@/components/ui'
import { useProductStore, useSupplierStore } from '@/stores'
import { DateRangeFilters } from '@/utils/date'

const dateToggleClasses = {
  active: 'border border-(--view-accent,var(--color-action-bg)) bg-(--view-accent,var(--color-action-bg)) text-(--color-action-text) shadow-sm hover:bg-(--view-accent-hover,var(--color-action-bg-hover))',
  inactive: 'border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) hover:bg-(--view-accent-soft,var(--color-bg-subtle))',
}

interface DocumentFiltersSectionProps {
  filters: DateRangeFilters
  setFilters: (filters: DateRangeFilters) => void
  onSearch: () => void
  onClear: () => void
  loading: boolean
}

/**
 * Filtros compartidos de documentos (compras/gastos): rango de fechas opcional +
 * autocomplete de proveedor y producto. Carga los stores de productos/proveedores.
 */
export default function DocumentFiltersSection({
  filters,
  setFilters,
  onSearch,
  onClear,
  loading,
}: Readonly<DocumentFiltersSectionProps>) {
  const products = useProductStore((state) => state.products)
  const suppliers = useSupplierStore((state) => state.suppliers)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  // Transformar datos para el autocomplete
  const supplierOptions = suppliers
    .filter(supplier => supplier.id !== undefined)
    .map(supplier => ({
      id: supplier.id!,
      label: supplier.name,
      name: supplier.name,
    }))

  const productOptions = products
    .filter(product => product.id !== undefined && product.name !== undefined)
    .map(product => ({
      id: product.id!,
      label: product.name!,
      name: product.name!,
    }))

  // Buscar la opción seleccionada para mostrar el valor inicial
  const selectedSupplier = supplierOptions.find(option => option.id.toString() === filters.personId)
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId)

  const supplierInitialValue = selectedSupplier?.label || filters.personName || ''
  const productInitialValue = selectedProduct?.label || filters.productName || ''

  // Key única para forzar re-render de los autocomplete cuando se limpian los filtros
  const supplierKey = `supplier-${filters.personId || 'empty'}`
  const productKey = `product-${filters.productId || 'empty'}`

  const toggleDateFilter = () => {
    setFilters({ ...filters, activeDate: !filters.activeDate })
  }

  return (
    <DocumentFiltersChrome onSearch={onSearch} onClear={onClear} loading={loading}>
      <div className="flex w-full flex-col gap-5">
        <div className="rounded-md bg-(--view-accent-soft,var(--color-bg-subtle)) p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-(--color-text-primary)">Rango de fechas</p>
              <p className="text-sm text-(--color-text-secondary)">
                Filtra por periodo.
              </p>
            </div>
            <Button
              type="button"
              variant={filters.activeDate ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleDateFilter}
              className={filters.activeDate ? dateToggleClasses.active : dateToggleClasses.inactive}
              disabled={loading}
            >
              {filters.activeDate ? 'Rango activo' : 'Rango de fechas'}
            </Button>
          </div>

          {filters.activeDate && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className='flex flex-col'>
                <label htmlFor='startDate' className="text-sm font-medium text-(--color-text-secondary) mb-1">Fecha inicio</label>
                <input
                  id='startDate'
                  name='startDate'
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) shadow-xs"
                />
              </div>
              <div className='flex flex-col'>
                <label htmlFor='endDate' className="text-sm font-medium text-(--color-text-secondary) mb-1">Fecha fin</label>
                <input
                  id='endDate'
                  name='endDate'
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) shadow-xs"
                />
              </div>
            </div>
          )}
        </div>

        <div className='grid w-full gap-4 md:grid-cols-2'>
          <div className='flex w-full flex-col'>
            <Autocomplete
              key={supplierKey}
              className="w-full"
              options={supplierOptions}
              label="Proveedor"
              placeholder="Buscar proveedor..."
              displayKey="label"
              initialValue={supplierInitialValue}
              onSelect={(option) => {
                const personId = option ? option.id.toString() : ''
                const personName = option && typeof option.label === 'string' ? option.label : ''
                setFilters({ ...filters, personId, personName })
              }}
              clearable={true}
              noOptionsText="No se encontraron proveedores"
            />
          </div>
          <div className='flex w-full flex-col'>
            <Autocomplete
              key={productKey}
              className="w-full"
              options={productOptions}
              label="Producto"
              placeholder="Buscar producto..."
              displayKey="label"
              initialValue={productInitialValue}
              onSelect={(option) => {
                const productId = option ? option.id.toString() : ''
                const productName = option && typeof option.label === 'string' ? option.label : ''
                setFilters({ ...filters, productId, productName })
              }}
              clearable={true}
              noOptionsText="No se encontraron productos"
            />
          </div>
        </div>
      </div>
    </DocumentFiltersChrome>
  )
}
