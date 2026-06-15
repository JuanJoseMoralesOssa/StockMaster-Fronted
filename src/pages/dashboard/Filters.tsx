import { ChevronDown } from 'lucide-react'
import Autocomplete from '../components/common/Autocomplete'
import ActionButtons from './components/ActionButtons'
import { useDashboard } from './DashboardContext'

function Filters() {
  const {
    filters,
    setFilters,
    products,
    suppliers,
    selectedFilter,
    setSelectedFilter,
    dashboardMode,
    resetFilters,
    loading,
  } = useDashboard()

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

  const startDateField = (
    <div className="flex flex-col">
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
  )

  const endDateField = (
    <div className="flex flex-col">
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
  )

  const actions = <ActionButtons onClear={resetFilters} loading={loading} />

  // Modo general: solo rango de fechas + acciones.
  if (!showDetailedFilters) {
    return (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:max-w-xl">
          {startDateField}
          {endDateField}
        </div>
        <div className="lg:shrink-0">{actions}</div>
      </div>
    )
  }

  // Modo detallado: tres columnas parejas.
  //  · Izquierda: fechas, una sobre otra.
  //  · Centro: proveedor y producto, mismo ancho, uno sobre otro.
  //  · Derecha: "Filtrar por" arriba y los botones abajo.
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
      <div className="flex flex-col gap-4">
        {startDateField}
        {endDateField}
      </div>

      <div className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
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
        <div className="mt-auto">{actions}</div>
      </div>
    </div>
  )
}

export default Filters
