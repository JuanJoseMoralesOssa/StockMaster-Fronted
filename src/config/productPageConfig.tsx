import { GenericPageConfig } from '../types/GenericConfig'
import Product from '../types/Product'
import { productService } from '../services/ProductService'
import { Package, Receipt, Search, ShoppingCart } from 'lucide-react'
import { Button, Input } from '../components/ui'

export interface ProductFilters {
  name: string
}

export const productPageConfig: GenericPageConfig<Product, ProductFilters> = {
  entityName: 'Producto',
  entityNamePlural: 'Productos',
  idField: 'id',

  columns: [
    {
      key: 'name',
      label: 'Nombre del Producto',
    },
    {
      key: 'balance',
      label: 'Balance',
      width: 'w-24',
      align: 'right',
      render: (product) => {
        const balance = product.balance ?? 0
        const balanceClass = balance < 10
          ? 'text-danger-700 font-semibold'
          : balance < 50
            ? 'text-warning-700'
            : 'text-success-700'
        return <span className={balanceClass}>{balance}</span>
      },
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Nombre del Producto',
      type: 'text',
      placeholder: 'Ej: Hueso, sebo o piel',
      required: true,
      // Campo principal y largo: ocupa la fila completa en el form 2-col de desktop
      // (deja `balance` solo debajo, y en edición —sin balance— queda full).
      fullWidth: true,
      validate: (value) => {
        if (value && typeof value === 'string' && value.length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        return undefined
      },
    },
    {
      name: 'balance',
      label: 'Balance Inicial',
      type: 'number',
      placeholder: '0',
      required: false,
      min: 0,
      defaultValue: 0,
      // El backend ignora balance en updates (solo lo modifica la reconciliación
      // de compras/pagos), así que solo se muestra al crear.
      hideOnEdit: true,
    },
  ],

  initialFilterState: {
    name: '',
  },

  renderCustomFilters: ({ filters, setFilters, onSearch, onClear, loading }) => (
    <form
      className="flex flex-col gap-3 md:flex-row md:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label htmlFor="product-name-filter" className="text-sm font-medium text-(--color-text-secondary)">
          Buscar por nombre
        </label>
        <Input
          id="product-name-filter"
          type="search"
          value={filters.name}
          placeholder="Nombre del producto..."
          onChange={(event) => setFilters({ ...filters, name: event.target.value })}
        />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:justify-end">
        <Button type="submit" variant="secondary" size="sm" className="w-full sm:w-fit" loading={loading} leftIcon={<Search className="h-4 w-4" />}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" size="sm" className="w-full sm:w-fit" disabled={loading} onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </form>
  ),

  actions: {
    canEdit: true,
    canDelete: true,
    customActions: [
      {
        icon: <Package className='mr-2 h-4 w-4' />,
        label: 'Ver Kardex',
        // Default no-op: ProductPage (src/pages/product/Product.tsx) overrides this
        // onClick to navigate to /kardex?productId=... using the router's navigate.
        onClick: () => {},
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
        condition: (product) => product.id !== undefined,
      },
      {
        icon: <ShoppingCart className='mr-2 h-4 w-4' />,
        label: 'Ver Compras',
        // Default no-op: ProductPage overrides onClick para navegar a
        // /compras?productId=... (igual que Proveedores con personId).
        onClick: () => {},
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
        condition: (product) => product.id !== undefined,
      },
      {
        icon: <Receipt className='mr-2 h-4 w-4' />,
        label: 'Ver Pagos',
        // Default no-op: ProductPage overrides onClick para navegar a
        // /pagos?productId=...
        onClick: () => {},
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
        condition: (product) => product.id !== undefined,
      },
    ],
  },

  service: productService,

  updatePartial: true,

  prepareDataForSubmit: async (data: Partial<Product>, isEdit: boolean) => {
    if (isEdit) {
      // El backend descarta balance en updates; no lo enviamos para evitar confusión.
      delete data.balance
      return data
    }
    // Asegurar que el balance sea un número
    if (data.balance !== undefined && data.balance !== null) {
      data.balance = Number(data.balance)
    }
    return data
  },

  validateData: async (data: Partial<Product>) => {
    // Validaciones personalizadas
    if (data.balance !== undefined && data.balance < 0) {
      return 'El balance no puede ser negativo'
    }
    return undefined
  },

  createSuccessMessage: 'Producto creado exitosamente',
  updateSuccessMessage: 'Producto actualizado exitosamente',
  deleteSuccessMessage: 'Producto eliminado exitosamente',
}
