import Person from "../../../types/Person"
import Product from "../../../types/Product"
import Autocomplete from "../../components/common/Autocomplete"
import { Button } from "../../../components/ui"

interface ExpenseFiltersProps {
  suppliers: Person[]
  products: Partial<Product>[]
  filters: { startDate: string; endDate: string; personId: string; productId: string, activeDate: boolean }
  setFilters: (range: { startDate: string; endDate: string; personId: string; productId: string, activeDate: boolean }) => void
}

function ExpenseFilters({ suppliers, filters, products, setFilters }: Readonly<ExpenseFiltersProps>) {
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
  const selectedSupplier = supplierOptions.find(option => option.id.toString() === filters.personId)
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId)

  // Valores iniciales para los autocomplete - usar key para forzar re-render cuando se limpien
  const supplierInitialValue = selectedSupplier?.label || ''
  const productInitialValue = selectedProduct?.label || ''

  // Crear una key única para forzar re-render cuando se limpien los filtros
  const supplierKey = `person-${filters.personId || 'empty'}`
  const productKey = `product-${filters.productId || 'empty'}`

  const toggleDateFilter = () => {
    setFilters({ ...filters, activeDate: !filters.activeDate })
  }

  return (
    <div className="flex flex-col gap-5 w-full md:w-fit">
      <div className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-(--color-text-primary)">Rango de fechas</p>
            <p className="text-sm text-(--color-text-secondary)">
              Actívalo solo cuando quieras limitar la búsqueda por periodo.
            </p>
          </div>
          <Button
            type="button"
            variant={filters.activeDate ? 'primary' : 'secondary'}
            size="sm"
            onClick={toggleDateFilter}
          >
            {filters.activeDate ? 'Rango activo' : 'Usar rango de fechas'}
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
                className="rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 py-2 text-(--color-text-primary) shadow-xs"
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
                className="rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 py-2 text-(--color-text-primary) shadow-xs"
              />
            </div>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='flex flex-col w-48'>
          <Autocomplete
            key={supplierKey}
            options={supplierOptions}
            label="Proveedor"
            placeholder="Buscar proveedor..."
            displayKey="label"
            initialValue={supplierInitialValue}
            onSelect={(option) => {
              const personId = option ? option.id.toString() : ''
              setFilters({ ...filters, personId })
            }}
            clearable={true}
            noOptionsText="No se encontraron proveedores"
          />
        </div>
        <div className='flex flex-col w-48'>
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
          />
        </div>
      </div>
    </div>
  )
}

export default ExpenseFilters
