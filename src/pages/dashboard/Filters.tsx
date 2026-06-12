import { ChevronDown } from "lucide-react"
import Person from "../../types/Person"
import Product from "../../types/Product"
import Autocomplete from "../components/common/Autocomplete"

interface FiltersProps {
  suppliers: Person[]
  products: Partial<Product>[]
  filters: { startDate: string; endDate: string; supplierId: string; productId: string }
  setFilters: (range: { startDate: string; endDate: string; supplierId: string; productId: string }) => void
  setSelectedFilter: (filter: string) => void
  selectedFilter: string
  dashboardMode?: 'detailed' | 'general'
}
function Filters({ suppliers, filters, products, setFilters, setSelectedFilter, selectedFilter, dashboardMode = 'detailed' }: Readonly<FiltersProps>) {
  const showDetailedFilters = dashboardMode === 'detailed'
  const labelClassName = "text-xs font-semibold text-(--color-text-secondary) uppercase tracking-widest mb-label"
  const inputClassName = "h-input w-full rounded-lg border-[1.5px] border-(--color-border) bg-(--color-bg-surface) px-3 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) caret-(--view-accent,var(--color-focus-ring)) outline-none transition-all focus:border-(--view-accent,var(--color-focus-ring)) focus:shadow-[0_0_0_3px_var(--nav-accent-ring)]"
  // Transformar datos para el autocomplete
  const supplierOptions = suppliers
    .filter(supplier => supplier.id !== undefined)
    .map(supplier => ({
      id: supplier.id!,
      label: supplier.name,
      name: supplier.name
    }))

  const productOptions = products
    .filter(product => product.id !== undefined && product.name !== undefined)
    .map(product => ({
      id: product.id!,
      label: product.name!,
      name: product.name!
    }))

  // Buscar la opción seleccionada para mostrar el valor inicial
  const selectedSupplier = supplierOptions.find(option => option.id.toString() === filters.supplierId)
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId)

  // Valores iniciales para los autocomplete - usar key para forzar re-render cuando se limpien
  const supplierInitialValue = selectedSupplier?.label || ''
  const productInitialValue = selectedProduct?.label || ''

  // Crear una key única para forzar re-render cuando se limpien los filtros
  const supplierKey = `supplier-${filters.supplierId || 'empty'}`
  const productKey = `product-${filters.productId || 'empty'}`

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 items-end">
        <div className='flex flex-col flex-1 min-w-44'>
          <label htmlFor='startDate' className={labelClassName}>Fecha inicio</label>
          <input
            id='startDate'
            name='startDate'
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className={`${inputClassName} font-mono`}
          />
        </div>
        <div className='flex flex-col flex-1 min-w-44'>
          <label htmlFor='endDate' className={labelClassName}>Fecha fin</label>
          <input
            id='endDate'
            name='endDate'
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className={`${inputClassName} font-mono`}
          />
        </div>

        {showDetailedFilters && (
          <div className='flex flex-col flex-1 min-w-48'>
            <Autocomplete
              key={supplierKey}
              options={supplierOptions}
              label="Proveedor"
              placeholder="Buscar proveedor..."
              displayKey="label"
              initialValue={supplierInitialValue}
              onSelect={(option) => {
                const supplierId = option ? option.id.toString() : ''
                setFilters({ ...filters, supplierId })
              }}
              clearable={true}
              noOptionsText="No se encontraron proveedores"
              className="flex flex-col"
              inputClassName={inputClassName}
              labelClassName={`${labelClassName} block w-full`}
            />
          </div>
        )}
        {showDetailedFilters && (
          <div className='flex flex-col flex-1 min-w-48'>
            <Autocomplete
              key={productKey}
              options={productOptions}
              label="Producto"
              placeholder="Buscar producto..."
              displayKey="label"
              initialValue={productInitialValue}
              onSelect={(option) => {
                const productId = option ? option.id.toString() : ''
                setFilters({ ...filters, productId })
              }}
              clearable={true}
              noOptionsText="No se encontraron productos"
              className="flex flex-col"
              inputClassName={inputClassName}
              labelClassName={`${labelClassName} block w-full`}
            />
          </div>
        )}

        {showDetailedFilters && (
          <div className='flex flex-col flex-1 min-w-44'>
            <label htmlFor='filter' className={labelClassName}>Filtrar por</label>
            <div className='relative'>
              <select
                id='filter'
                name='filter'
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`${inputClassName} appearance-none pr-9`}
              >
                <option value="all">Todos</option>
                <option value="withDebt">Con deuda</option>
                <option value="fullyPaid">Pagados totalmente</option>
              </select>
              <ChevronDown
                className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)'
                aria-hidden='true'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Filters
