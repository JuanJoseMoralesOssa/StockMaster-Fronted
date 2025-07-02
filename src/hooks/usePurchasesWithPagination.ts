import { useCrudWithPagination, createCrudPaginationConfig } from './useCrudWithPagination'
import { purchaseService } from '../services/PurchaseService'
import Purchase from '../types/Purchase'
import { PaginatedResponse } from '../types/PaginatedResponse'

// Tipo para filtros específicos de compras
interface PurchaseFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  personId?: number
  minTotal?: number
  maxTotal?: number
}

/**
 * Hook especializado para manejo de compras con paginación
 * Combina CRUD + Paginación usando el hook genérico
 */
export const usePurchasesWithPagination = (initialPageSize = 10) => {
  // Función de fetch adaptada para incluir filtros específicos de compras
  const fetchPurchases = async (
    page: number,
    limit: number,
    filters?: Record<string, unknown>,
    sortBy = 'date',
    sortOrder = 'desc'
  ): Promise<PaginatedResponse<Purchase>> => {
    // Aquí adaptarías los filtros al formato que espera tu API
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(([_, value]) => value !== null && value !== undefined && value !== '')
      )
    })

    // Simulación - reemplazar con tu llamada real a la API
    return await purchaseService.getAll(page, limit) // Tu implementación real aquí
  }

  // Validaciones específicas de negocio para compras
  const purchaseValidations = {
    create: (data: Purchase) => {
      if (!data.date) {
        throw new Error('La fecha de compra es requerida')
      }
      if (!data.purchase_details?.length) {
        throw new Error('Debe agregar al menos un detalle de compra')
      }
      for (const detail of data.purchase_details) {
        if (detail.toCreate && !detail.toDelete) {
          if (!detail.product?.id || !detail.person?.id) {
            throw new Error('Todos los detalles deben tener producto y proveedor definidos')
          }
          if (!detail.weight_kg || detail.weight_kg <= 0) {
            throw new Error('El peso debe ser mayor a cero')
          }
        }
      }
    },
    update: (data: Purchase) => {
      if (!data.id) {
        throw new Error('ID de compra requerido para actualización')
      }
      if (!data.date) {
        throw new Error('La fecha de compra es requerida')
      }
      for (const detail of data.purchase_details ?? []) {
        if (detail.toDelete) continue
        if (!detail.productId || !detail.personId) {
          throw new Error('Producto o proveedor indefinido en detalle')
        }
        if (!detail.weight_kg || detail.weight_kg <= 0) {
          throw new Error('El peso debe ser mayor a cero')
        }
      }
    },
    delete: async (id: number) => {
      // Lógica específica antes de eliminar
      await purchaseService.deleteWithDetails(id)
    }
  }

  // Configuración del hook CRUD + Paginación
  const config = createCrudPaginationConfig<Purchase>(
    'Compra',
    fetchPurchases,
    {
      create: purchaseService.createWithDetails,
      update: purchaseService.updateWithDetails,
      delete: purchaseService.delete,
    },
    {
      validations: purchaseValidations,
      initialPageSize,
      initialSortBy: 'date',
      initialSortOrder: 'desc'
    }
  )

  // Usar el hook genérico con la configuración específica
  const hookResult = useCrudWithPagination<Purchase>(config)

  // Métodos específicos para compras que extienden la funcionalidad base
  const createPurchaseAndGoToFirst = async (purchaseData: Purchase) => {
    return await hookResult.createItem(purchaseData, {
      goToFirstPage: true,
      revalidateAfter: true
    })
  }

  const updatePurchaseWithReorder = async (purchaseData: Purchase) => {
    return await hookResult.updateItem(purchaseData, {
      revalidateAfter: true // Siempre revalidar para mantener orden correcto
    })
  }

  const deletePurchaseWithConfirm = async (id: number, purchaseName?: string) => {
    const confirmMessage = purchaseName
      ? `¿Eliminar la compra "${purchaseName}"? Esta acción eliminará también todos sus detalles.`
      : '¿Estás seguro de que quieres eliminar esta compra? Esta acción eliminará también todos sus detalles.'

    return await hookResult.deleteItem(id, undefined, {
      customConfirmMessage: confirmMessage,
      revalidateAfter: true
    })
  }

  // Filtros específicos para compras
  const applyPurchaseFilters = async (filters: PurchaseFilters) => {
    // Convertir filtros específicos al formato genérico
    const genericFilters: Record<string, unknown> = {}

    if (filters.search) {
      genericFilters.search = filters.search
    }
    if (filters.dateFrom) {
      genericFilters.dateFrom = filters.dateFrom
    }
    if (filters.dateTo) {
      genericFilters.dateTo = filters.dateTo
    }
    if (filters.personId) {
      genericFilters.personId = filters.personId
    }
    if (filters.minTotal) {
      genericFilters.minTotal = filters.minTotal
    }
    if (filters.maxTotal) {
      genericFilters.maxTotal = filters.maxTotal
    }

    await hookResult.applyFilters(genericFilters)
  }

  return {
    // Exponer toda la funcionalidad del hook base
    ...hookResult,

    // Métodos específicos para compras
    createPurchaseAndGoToFirst,
    updatePurchaseWithReorder,
    deletePurchaseWithConfirm,
    applyPurchaseFilters,

    // Helpers específicos para compras
    clearFilters: () => applyPurchaseFilters({}),
    sortByDate: () => hookResult.handleSort('date'),
    sortByTotal: () => hookResult.handleSort('total_kg'),
  }
}

/**
 * Ejemplo de uso en un componente
 */
/*
const PurchasesComponent = () => {
  const {
    data: purchases,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,

    // Operaciones CRUD
    createPurchaseAndGoToFirst,
    updatePurchaseWithReorder,
    deletePurchaseWithConfirm,

    // Paginación
    goToPage,
    setItemsPerPage,

    // Filtros
    applyPurchaseFilters,
    clearFilters,

    // Ordenamiento
    sortByDate,
    sortByTotal
  } = usePurchasesWithPagination(20)

  const handleCreatePurchase = async (purchaseData: Purchase) => {
    const result = await createPurchaseAndGoToFirst(purchaseData)
    if (result) {
      console.log('Compra creada:', result)
    }
  }

  const handleDeletePurchase = async (id: number, name: string) => {
    const success = await deletePurchaseWithConfirm(id, name)
    if (success) {
      console.log('Compra eliminada exitosamente')
    }
  }

  const handleFilterChange = (filters: PurchaseFilters) => {
    applyPurchaseFilters(filters)
  }

  return (
    <div>
      // Tu componente aquí...
    </div>
  )
}
*/
