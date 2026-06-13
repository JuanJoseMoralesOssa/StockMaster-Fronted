import { useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui'
import Autocomplete from '@/pages/components/common/Autocomplete'
import { useProductStore } from '@/stores'
import { KARDEX_OPERATION_OPTIONS, KardexFilters } from '../kardexFilters'

const dateToggleClasses = {
  active: 'w-full border border-(--view-accent,var(--color-action-bg)) bg-(--view-accent,var(--color-action-bg)) text-white shadow-sm hover:bg-(--view-accent-hover,var(--color-action-bg-hover)) md:w-fit',
  inactive: 'w-full border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) hover:bg-(--view-accent-soft,var(--color-bg-subtle)) md:w-fit',
}

interface KardexFiltersSectionProps {
  filters: KardexFilters
  setFilters: (filters: KardexFilters) => void
  onSearch: () => void
  onClear: () => void
  loading: boolean
}

/** Filtros de kardex: producto (autocomplete), operación y rango de fechas. */
export default function KardexFiltersSection({
  filters,
  setFilters,
  onSearch,
  onClear,
  loading,
}: Readonly<KardexFiltersSectionProps>) {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const productOptions = products
    .filter(product => product.id !== undefined && product.name !== undefined)
    .map(product => ({
      id: product.id!,
      label: product.name,
      name: product.name,
    }))
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId)
  const selectedProductName = selectedProduct?.label || filters.productName

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Autocomplete
          key={`kardex-product-${filters.productId || 'empty'}`}
          options={productOptions}
          label="Producto"
          placeholder="Buscar producto..."
          displayKey="label"
          initialValue={selectedProductName}
          onSelect={(option) => setFilters({
            ...filters,
            productId: option ? option.id.toString() : '',
            productName: option && typeof option.label === 'string' ? option.label : '',
          })}
          clearable
          noOptionsText="No se encontraron productos"
        />

        <div className="flex flex-col">
          <label htmlFor="kardex-operation-filter" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
            Operacion
          </label>
          <select
            id="kardex-operation-filter"
            value={filters.operation}
            onChange={(event) => setFilters({ ...filters, operation: event.target.value })}
            className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
          >
            <option value="">Todas</option>
            {KARDEX_OPERATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="rounded-md bg-(--view-accent-soft,var(--color-bg-subtle)) p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Button
            type="button"
            variant={filters.activeDate ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, activeDate: !filters.activeDate })}
            className={filters.activeDate ? dateToggleClasses.active : dateToggleClasses.inactive}
            disabled={loading}
          >
            {filters.activeDate ? 'Rango activo' : 'Filtrar por fechas'}
          </Button>

          {filters.activeDate && (
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="kardex-start-date" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
                  Fecha inicio
                </label>
                <input
                  id="kardex-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="kardex-end-date" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
                  Fecha fin
                </label>
                <input
                  id="kardex-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-fit" loading={loading} leftIcon={<Search className="h-4 w-4" />}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" size="sm" className="w-full sm:w-fit" disabled={loading} leftIcon={<X className="h-4 w-4" />} onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </form>
  )
}
