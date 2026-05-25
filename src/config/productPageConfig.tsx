import { GenericPageConfig } from '../types/GenericConfig'
import Product from '../types/Product'
import { productService } from '../services/ProductService'
import { Package, Search } from 'lucide-react'
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
      key: 'stock',
      label: 'Stock',
      width: 'w-24',
      render: (product) => {
        const stock = product.stock ?? 0
        const stockClass = stock < 10
          ? 'text-danger-700 font-semibold'
          : stock < 50
            ? 'text-warning-700'
            : 'text-success-700'
        return <span className={stockClass}>{stock}</span>
      },
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Nombre del Producto',
      type: 'text',
      placeholder: 'Ej: Laptop HP 15"',
      required: true,
      validate: (value) => {
        if (value && typeof value === 'string' && value.length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        return undefined
      },
    },
    {
      name: 'stock',
      label: 'Stock Inicial',
      type: 'number',
      placeholder: '0',
      required: false,
      min: 0,
      defaultValue: 0,
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
        <Button type="submit" size="sm" className="w-full sm:w-fit" loading={loading} leftIcon={<Search className="h-4 w-4" />}>
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
        onClick: (product) => {
          console.log('Ver kardex de:', product.name)
          // Aquí podrías navegar a la página de kardex
          // navigate(`/kardex?productId=${product.id}`)
        },
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
        condition: (product) => product.id !== undefined,
      },
    ],
  },

  service: productService,

  prepareDataForSubmit: async (data: Partial<Product>) => {
    // Asegurar que el stock sea un número
    if (data.stock !== undefined && data.stock !== null) {
      data.stock = Number(data.stock)
    }
    return data
  },

  validateData: async (data: Partial<Product>) => {
    // Validaciones personalizadas
    if (data.stock !== undefined && data.stock < 0) {
      return 'El stock no puede ser negativo'
    }
    return undefined
  },

  createSuccessMessage: 'Producto creado exitosamente',
  updateSuccessMessage: 'Producto actualizado exitosamente',
  deleteSuccessMessage: 'Producto eliminado exitosamente',
}
