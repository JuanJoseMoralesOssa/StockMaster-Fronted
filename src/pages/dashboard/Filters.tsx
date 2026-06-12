import { ChevronDown } from 'lucide-react'
import Autocomplete from '../components/common/Autocomplete'
import { useDashboard } from './DashboardContext'

function Filters() {
  const { filters, setFilters, products, suppliers, selectedFilter, setSelectedFilter, dashboardMode } = useDashboard()

  const showDetailedFilters = dashboardMode === 'detailed'
  const labelClassName = 'text-xs font-semibold text-(--color-text-secondary) uppercase tracking-widest mb-label'
  const inputClassName = 'h-input w-full rounded-lg border-[1.5px] border-(--color-border) bg-(--color-bg-surface) px-3 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) caret-(--view-accent,var(--color-focus-ring)) outline-none transition-all focus:border-(--view-accent,var(--color-focus-ring)) focus:shadow-[0_0_0_3px_var(--nav-accent-ring)]'

  const supplierOptions = suppliers
    .filter(s => s.id !== undefined)
    .map(s => ({ id: s.id!, label: s.name, name: s.name }))

  const productOptions = products
    .filter(p => p.id !== undefined && p.name !== undefined)
    .map(p => ({ id: p.id!, label: p.name!, name: p.name! }))

  const selectedSupplier = supplierOptions.find(o => o.id.toString() === filters.supplierId)
  const selectedProduct = productOptions.find(o => o.id.toString() === filters.productId)

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col flex-1 min-w-44 lg:max-w-60">
          <label htmlFor="startDate" className={labelClassName}>Fecha inicio</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className={`${inputClassName} font-mono`}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-44 lg:max-w-60">
          <label htmlFor="endDate" className={labelClassName}>Fecha fin</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className={`${inputClassName} font-mono`}
          />
        </div>

        {showDetailedFilters && (
          <div className="flex flex-col flex-1 min-w-48">
            <Autocomplete
              key={`supplier-${filters.supplierId || 'empty'}`}
              options={supplierOptions}
              label="Proveedor"
              placeholder="Buscar proveedor..."
              displayKey="label"
              initialValue={selectedSupplier?.label || ''}
              onSelect={(option) => setFilters({ ...filters, supplierId: option ? option.id.toString() : '' })}
              clearable={true}
              noOptionsText="No se encontraron proveedores"
              className="flex flex-col"
              inputClassName={inputClassName}
              labelClassName={`${labelClassName} block w-full`}
            />
          </div>
        )}

        {showDetailedFilters && (
          <div className="flex flex-col flex-1 min-w-48">
            <Autocomplete
              key={`product-${filters.productId || 'empty'}`}
              options={productOptions}
              label="Producto"
              placeholder="Buscar producto..."
              displayKey="label"
              initialValue={selectedProduct?.label || ''}
              onSelect={(option) => setFilters({ ...filters, productId: option ? option.id.toString() : '' })}
              clearable={true}
              noOptionsText="No se encontraron productos"
              className="flex flex-col"
              inputClassName={inputClassName}
              labelClassName={`${labelClassName} block w-full`}
            />
          </div>
        )}

        {showDetailedFilters && (
          <div className="flex flex-col flex-1 min-w-44 lg:max-w-56">
            <label htmlFor="filter" className={labelClassName}>Filtrar por</label>
            <div className="relative">
              <select
                id="filter"
                name="filter"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`${inputClassName} appearance-none pr-9`}
              >
                <option value="all">Todos</option>
                <option value="withDebt">Con deuda</option>
                <option value="fullyPaid">Pagados totalmente</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Filters
