import { GenericPageConfig } from '../types/GenericConfig'
import Product from '../types/Product'
import { productService } from '../services/ProductService'
import { Package } from 'lucide-react'

export const productPageConfig: GenericPageConfig<Product> = {
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
          ? 'text-red-600 font-semibold'
          : stock < 50
            ? 'text-yellow-600'
            : 'text-green-600'
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
        className: 'text-blue-600 focus:text-blue-700',
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
