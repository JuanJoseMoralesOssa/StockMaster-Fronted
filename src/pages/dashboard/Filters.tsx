import Person from "../../types/Person";
import Product from "../../types/Product";
import Autocomplete from "../components/common/Autocomplete";

interface FiltersProps {
  suppliers: Person[];
  products: Partial<Product>[];
  filters: { startDate: string; endDate: string; supplierId: string; productId: string };
  setFilters: (range: { startDate: string; endDate: string; supplierId: string; productId: string }) => void;
  setSelectedFilter: (filter: string) => void;
  selectedFilter: string;
}
function Filters({ suppliers, filters, products, setFilters, setSelectedFilter, selectedFilter }: Readonly<FiltersProps>) {
  // Transformar datos para el autocomplete
  const supplierOptions = suppliers
    .filter(supplier => supplier.id !== undefined)
    .map(supplier => ({
      id: supplier.id!,
      label: supplier.name,
      name: supplier.name
    }));

  const productOptions = products
    .filter(product => product.id !== undefined && product.name !== undefined)
    .map(product => ({
      id: product.id!,
      label: product.name!,
      name: product.name!
    }));

  // Buscar la opción seleccionada para mostrar el valor inicial
  const selectedSupplier = supplierOptions.find(option => option.id.toString() === filters.supplierId);
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId);

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
              <div className='flex flex-col w-48'>
                <Autocomplete
                  options={supplierOptions}
                  label="Proveedor"
                  placeholder="Buscar proveedor..."
                  displayKey="label"
                  initialValue={selectedSupplier?.label || ''}
                  onSelect={(option) => {
                    const supplierId = option ? option.id.toString() : '';
                    setFilters({ ...filters, supplierId });
                  }}
                  clearable={true}
                  noOptionsText="No se encontraron proveedores"
                />
              </div>
              <div className='flex flex-col w-48'>
                <Autocomplete
                  options={productOptions}
                  label="Producto"
                  placeholder="Buscar producto..."
                  displayKey="label"
                  initialValue={selectedProduct?.label || ''}
                  onSelect={(option) => {
                    const productId = option ? option.id.toString() : '';
                    setFilters({ ...filters, productId });
                  }}
                  clearable={true}
                  noOptionsText="No se encontraron productos"
                />
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
