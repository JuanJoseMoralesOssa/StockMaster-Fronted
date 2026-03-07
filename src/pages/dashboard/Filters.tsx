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
      <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
        <div className='flex flex-col w-full sm:w-auto flex-1 md:flex-none'>
          <label htmlFor='startDate' className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-label">Fecha inicio</label>
          <input
            id='startDate'
            name='startDate'
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="h-input border-[1.5px] border-gray-200 rounded-lg px-3 text-[13.5px] font-mono text-gray-900 bg-white outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all w-full"
          />
        </div>
        <div className='flex flex-col w-full sm:w-auto flex-1 md:flex-none'>
          <label htmlFor='endDate' className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-label">Fecha fin</label>
          <input
            id='endDate'
            name='endDate'
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="h-input border-[1.5px] border-gray-200 rounded-lg px-3 text-[13.5px] font-mono text-gray-900 bg-white outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all w-full"
          />
        </div>

        {showDetailedFilters && (
          <div className='flex flex-col w-full lg:w-48 lg:flex-1'>
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
              inputClassName="w-full h-input border-[1.5px] border-gray-200 rounded-lg px-3 text-[13.5px] text-gray-900 bg-white outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all flex items-center pr-8"
              labelClassName="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-label block w-full"
            />
          </div>
        )}
        {showDetailedFilters && (
          <div className='flex flex-col w-full lg:w-48 lg:flex-1'>
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
              inputClassName="w-full h-input border-[1.5px] border-gray-200 rounded-lg px-3 text-[13.5px] text-gray-900 bg-white outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all flex items-center pr-8"
              labelClassName="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-label block w-full"
            />
          </div>
        )}

        {showDetailedFilters && (
          <div className='flex flex-col w-full sm:w-auto flex-1 md:flex-none'>
            <label htmlFor='filter' className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-label">Filtrar por</label>
            <select
              id='filter'
              name='filter'
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="h-input border-[1.5px] border-gray-200 rounded-lg px-3 pr-8 text-[13.5px] text-gray-900 bg-white outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-size-[10px_10px] bg-no-repeat bg-position-[right_10px_center]"
            >
              <option value="all">Todos</option>
              <option value="withDebt">Con deuda</option>
              <option value="fullyPaid">Pagados totalmente</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default Filters
