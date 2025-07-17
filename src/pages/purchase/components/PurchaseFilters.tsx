import Person from "../../../types/Person";
import Product from "../../../types/Product";
import Autocomplete from "../../components/common/Autocomplete";

interface PurchaseFiltersProps {
  suppliers: Person[];
  products: Partial<Product>[];
  filters: { startDate: string; endDate: string; personId: string; productId: string, activeDate: boolean };
  setFilters: (range: { startDate: string; endDate: string; personId: string; productId: string, activeDate: boolean }) => void;
}

function PurchaseFilters({ suppliers, filters, products, setFilters }: Readonly<PurchaseFiltersProps>) {
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
  const selectedSupplier = supplierOptions.find(option => option.id.toString() === filters.personId);
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId);

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full md:w-fit">
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <input
            type="checkbox"
            id="useDateFilter"
            checked={filters.activeDate}
            onChange={(e) => setFilters({ ...filters, activeDate: e.target.checked })}
          />
          <label htmlFor="useDateFilter" className="text-sm text-gray-700 font-medium">
            Filtrar por fecha
          </label>
        </div>
        <div className="flex flex-row gap-2">
          <div className='flex flex-col'>
            <label htmlFor='startDate' className="text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              id='startDate'
              name='startDate'
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="border rounded p-2"
              disabled={!filters.activeDate}
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
              disabled={!filters.activeDate}
            />
          </div>
        </div>
      </div>
      <div className='flex gap-4 md:mt-7'>
        <div className='flex flex-col w-48'>
          <Autocomplete
            options={supplierOptions}
            label="Proveedor"
            placeholder="Buscar proveedor..."
            displayKey="label"
            initialValue={selectedSupplier?.label || ''}
            onSelect={(option) => {
              const personId = option ? option.id.toString() : '';
              setFilters({ ...filters, personId });
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
  )
}

export default PurchaseFilters
