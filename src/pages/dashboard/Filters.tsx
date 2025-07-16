import Person from "../../types/Person";
import Product from "../../types/Product";

interface FiltersProps {
  suppliers: Person[];
  products: Partial<Product>[];
  filters: { startDate: string; endDate: string; supplierId: string; productId: string };
  setFilters: (range: { startDate: string; endDate: string; supplierId: string; productId: string }) => void;
  setSelectedFilter: (filter: string) => void;
  selectedFilter: string;
}
function Filters({ suppliers, filters, products, setFilters, setSelectedFilter, selectedFilter }: Readonly<FiltersProps>) {
  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full md:w-fit">
            <div className='flex gap-4'>
              <div className='flex flex-col'>
                <label htmlFor='startDate' className="text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  id='startDate'
                  name='startDate'
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="border rounded p-2"
                />
              </div>
              <div className='flex flex-col'>
                <label htmlFor='endDate' className="text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  id='endDate'
                  name='endDate'
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="border rounded p-2"
                />
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='flex flex-col'>
                <label htmlFor='supplierId' className="text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  id='supplierId'
                  name='supplierId'
                  value={filters.supplierId}
                  onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
                  className="border rounded p-2 w-fit"
                  required>
                  <option value=''>Selecciona un proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex flex-col'>
                <label htmlFor='productId' className="text-sm font-medium text-gray-700 mb-1">Producto</label>
                <select
                  id='productId'
                  name='productId'
                  className="border rounded p-2 w-fit"
                  value={filters.productId}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                  required>
                  <option value=''>Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          <div className='flex flex-col justify-between items-center w-full md:w-fit'>
            <label htmlFor='filter' className="text-sm font-medium text-gray-700 mb-1">Filtrar por</label>
            <select
              id='filter'
              name='filter'
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded p-2 w-fit"
            >
              <option value="all">Todos</option>
              <option value="withDebt">Con deuda</option>
              <option value="fullyPaid">Pagados totalmente</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filters
