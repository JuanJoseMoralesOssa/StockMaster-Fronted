import Person from "../../../types/Person";
import Product from "../../../types/Product";
import Autocomplete from "../../components/common/Autocomplete";
import { Button } from "../../../components/ui";

const dateToggleClasses = {
  active: 'border border-[var(--view-accent,var(--color-action-bg))] bg-[var(--view-accent,var(--color-action-bg))] text-white shadow-sm hover:bg-[var(--view-accent-hover,var(--color-action-bg-hover))]',
  inactive: 'border border-[var(--view-accent-border,var(--color-border-strong))] bg-(--color-bg-surface) text-[var(--view-accent-text,var(--color-text-link))] hover:bg-[var(--view-accent-soft,var(--color-bg-subtle))]',
}

interface PurchaseFiltersValue {
  startDate: string
  endDate: string
  personId: string
  personName?: string
  productId: string
  productName?: string
  activeDate: boolean
}

interface PurchaseFiltersProps {
  suppliers: Person[];
  products: Partial<Product>[];
  filters: PurchaseFiltersValue;
  setFilters: (range: PurchaseFiltersValue) => void;
  loading?: boolean;
}

function PurchaseFilters({ suppliers, filters, products, setFilters, loading = false }: Readonly<PurchaseFiltersProps>) {
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

  // Valores iniciales para los autocomplete - usar key para forzar re-render cuando se limpien
  const supplierInitialValue = selectedSupplier?.label || filters.personName || '';
  const productInitialValue = selectedProduct?.label || filters.productName || '';

  // Crear una key única para forzar re-render cuando se limpien los filtros
  const supplierKey = `supplier-${filters.personId || 'empty'}`;
  const productKey = `product-${filters.productId || 'empty'}`;

  const toggleDateFilter = () => {
    setFilters({ ...filters, activeDate: !filters.activeDate });
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="rounded-md bg-[var(--view-accent-soft,var(--color-bg-subtle))] p-3">
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
              const personId = option ? option.id.toString() : '';
              const personName = option && typeof option.label === 'string' ? option.label : '';
              setFilters({ ...filters, personId, personName });
            }}
            clearable={true}
            noOptionsText="No se encontraron proveedores"
            labelClassName="block text-sm font-medium text-(--color-text-secondary) mb-1"
            inputClassName="w-full h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 pr-8 text-sm text-(--color-text-primary) transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
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
              const productId = option ? option.id.toString() : '';
              const productName = option && typeof option.label === 'string' ? option.label : '';
              setFilters({ ...filters, productId, productName });
            }}
            clearable={true}
            noOptionsText="No se encontraron productos"
            labelClassName="block text-sm font-medium text-(--color-text-secondary) mb-1"
            inputClassName="w-full h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 pr-8 text-sm text-(--color-text-primary) transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
          />
        </div>
      </div>
    </div>
  )
}

export default PurchaseFilters
