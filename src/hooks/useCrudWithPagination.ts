import { useState, useCallback, useEffect, useMemo } from 'react'
import { useCrudOperations, CrudService } from './useCrudOperations'
import { useServerPagination } from './useServerPagination'
import { useToast } from './useToast'
import { PaginatedResponse } from '../types/PaginatedResponse'

/**
 * Configuración para CRUD con paginación
 */
interface CrudPaginationConfig<T> {
  entityName: string
  fetchFunction: (page: number, limit: number, filters?: Record<string, unknown>, sortBy?: string, sortOrder?: string) => Promise<PaginatedResponse<T>>
  service: CrudService<T>
  validations?: {
    create?: (data: T) => Promise<void> | void
    update?: (data: T) => Promise<void> | void
    delete?: (id: number, data?: T) => Promise<void> | void
  }
  customMessages?: Partial<{
    creating: string
    created: string
    createError: string
    updating: string
    updated: string
    updateError: string
    deleting: string
    deleted: string
    deleteError: string
    deleteConfirm: string
  }>
  options?: {
    autoRefresh?: boolean
    refreshInterval?: number
    optimisticUpdates?: boolean
    confirmDelete?: boolean
    defaultSortBy?: string
    defaultSortOrder?: 'asc' | 'desc'
    defaultPageSize?: number
  }
}

/**
 * Opciones para operaciones CRUD con paginación
 */
interface CrudPaginationOperationOptions {
  showLoading?: boolean
  showSuccess?: boolean
  showError?: boolean
  confirmDelete?: boolean
  customConfirmMessage?: string
  optimistic?: boolean
  goToFirstPage?: boolean
  revalidate?: boolean
}

/**
 * Filtros y ordenamiento
 */
interface FilterSort {
  filters: Record<string, unknown>
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/**
 * Hook que combina CRUD + Paginación siguiendo principios SOLID
 * Separa responsabilidades pero las orquesta de manera inteligente
 */
export const useCrudWithPagination = <T extends { id?: number }>(
  config: CrudPaginationConfig<T>
) => {
  const { showError, showSuccess, confirmDelete } = useToast()

  const {
    entityName,
    fetchFunction,
    service,
    validations,
    customMessages,
    options = {}
  } = config

  const {
    autoRefresh = false,
    refreshInterval = 30000,
    optimisticUpdates = true,
    confirmDelete: shouldConfirmDelete = true,
    defaultSortBy = 'createdAt',
    defaultSortOrder = 'desc',
    defaultPageSize = 10
  } = options

  // Estado para filtros y ordenamiento
  const [filterSort, setFilterSort] = useState<FilterSort>({
    filters: {},
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder
  })

  // Estado de operaciones
  const [operationLoading, setOperationLoading] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)

  // Función de fetch mejorada que incluye filtros y ordenamiento
  const enhancedFetchFunction = useCallback(
    (page: number, limit: number) => {
      return fetchFunction(
        page,
        limit,
        filterSort.filters,
        filterSort.sortBy,
        filterSort.sortOrder
      )
    },
    [fetchFunction, filterSort]
  )

  // Hook de paginación del servidor
  const pagination = useServerPagination({
    fetchFunction: enhancedFetchFunction,
    initialPage: 1,
    initialLimit: defaultPageSize,
    dependencies: [filterSort]
  })

  // Configuración CRUD
  const crudConfig = useMemo(() => ({
    entityName,
    service,
    validations,
    customMessages
  }), [entityName, service, validations, customMessages])

  // Hook CRUD
  const crud = useCrudOperations(crudConfig)

  // Función auxiliar para verificar si un item coincide con los filtros actuales
  const itemMatchesFilters = useCallback((item: T, filters: Record<string, unknown>): boolean => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      const itemValue = (item as Record<string, unknown>)[key]
      if (itemValue === undefined || itemValue === null) return false
      return itemValue.toString().toLowerCase().includes(value.toString().toLowerCase())
    })
  }, [])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      pagination.refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, pagination])

  /**
   * Crear un elemento con manejo inteligente de paginación
   */
  const createItem = useCallback(async (
    data: T,
    options: CrudPaginationOperationOptions = {}
  ): Promise<T | null> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      optimistic: optimisticUpdates,
      goToFirstPage: false,
      revalidate: true,
      ...options
    }

    setOperationLoading(true)
    setOperationError(null)

    try {
      const result = await crud.create(data, {
        showLoading: opts.showLoading,
        showSuccess: false, // Lo manejamos aquí
        showError: opts.showError
      })

      if (!result) {
        return null
      }

      // Verificar si el nuevo item coincide con filtros actuales
      if (itemMatchesFilters(result, filterSort.filters)) {
        if (pagination.currentPage === 1) {
          // Estamos en la primera página, agregar el item optimistamente
          if (opts.optimistic && opts.revalidate) {
            // Nota: Para actualizaciones optimistas completas, necesitaríamos
            // modificar el hook useServerPagination para exponer métodos de actualización
            // Por ahora, solo revalidamos
            setTimeout(() => pagination.refresh(), 100)
          } else if (opts.revalidate) {
            pagination.refresh()
          }
        } else {
          // No estamos en la primera página
          if (opts.goToFirstPage) {
            const shouldGoToFirst = await confirmDelete(
              `${entityName} creado exitosamente. ¿Ir a la primera página para verlo?`,
              'Elemento creado'
            )
            if (shouldGoToFirst) {
              pagination.goToPage(1)
            }
          } else if (opts.revalidate) {
            // Solo actualizar el total
            pagination.refresh()
          }
        }
      } else {
        // El item no coincide con filtros actuales
        if (opts.showSuccess) {
          showSuccess(`${entityName} creado exitosamente, pero no es visible con los filtros actuales`)
        }
      }

      if (opts.showSuccess && itemMatchesFilters(result, filterSort.filters)) {
        showSuccess(`${entityName} creado exitosamente`)
      }

      return result

    } catch (error) {
      const message = error instanceof Error ? error.message : `Error al crear ${entityName.toLowerCase()}`
      setOperationError(message)
      if (opts.showError) {
        showError(message)
      }
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [
    crud,
    filterSort,
    pagination,
    itemMatchesFilters,
    optimisticUpdates,
    entityName,
    showSuccess,
    showError,
    confirmDelete
  ])

  /**
   * Actualizar un elemento con manejo inteligente
   */
  const updateItem = useCallback(async (
    data: T,
    options: CrudPaginationOperationOptions = {}
  ): Promise<T | null> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      optimistic: optimisticUpdates,
      revalidate: true,
      ...options
    }

    if (!data.id) {
      const message = 'ID requerido para actualizar'
      setOperationError(message)
      if (opts.showError) {
        showError(message)
      }
      return null
    }

    setOperationLoading(true)
    setOperationError(null)

    try {
      // Actualización optimista - comentada hasta implementar completamente
      // if (opts.optimistic) {
      //   const optimisticData = pagination.data.map(item =>
      //     item.id === data.id ? { ...item, ...data } : item
      //   )
      //   // Aquí actualizaríamos el estado de paginación
      // }

      const result = await crud.update(data, {
        showLoading: opts.showLoading,
        showSuccess: false,
        showError: opts.showError
      })

      if (!result) {
        // Rollback comentado hasta implementar completamente
        // if (opts.optimistic) {
        //   // Restaurar datos originales
        // }
        return null
      }

      // Verificar si el item actualizado sigue coincidiendo con filtros
      if (itemMatchesFilters(result, filterSort.filters)) {
        // El item sigue siendo visible, actualizar localmente si es optimista
        if (opts.revalidate) {
          // Revalidar para ver cambios de orden
          setTimeout(() => pagination.refresh(), 100)
        }
      } else {
        // El item ya no coincide con filtros - necesita revalidación completa
        pagination.refresh()
      }

      if (opts.showSuccess) {
        showSuccess(`${entityName} actualizado exitosamente`)
      }

      return result

    } catch (error) {
      // Rollback comentado hasta implementar completamente
      // if (opts.optimistic) {
      //   // Restaurar datos originales
      // }

      const message = error instanceof Error ? error.message : `Error al actualizar ${entityName.toLowerCase()}`
      setOperationError(message)
      if (opts.showError) {
        showError(message)
      }
      return null
    } finally {
      setOperationLoading(false)
    }
  }, [
    crud,
    pagination,
    filterSort,
    itemMatchesFilters,
    optimisticUpdates,
    entityName,
    showSuccess,
    showError
  ])

  /**
   * Eliminar un elemento con manejo inteligente de páginas
   */
  const deleteItem = useCallback(async (
    id: number,
    data?: T,
    options: CrudPaginationOperationOptions = {}
  ): Promise<boolean> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      confirmDelete: shouldConfirmDelete,
      optimistic: optimisticUpdates,
      revalidate: true,
      ...options
    }

    setOperationLoading(true)
    setOperationError(null)

    try {
      // Actualización optimista - comentada hasta implementar completamente
      // if (opts.optimistic) {
      //   const newData = pagination.data.filter(item => item.id !== id)
      //   // Aquí actualizaríamos el estado de paginación
      // }

      const result = await crud.delete(id, data, {
        showLoading: opts.showLoading,
        showSuccess: false,
        showError: opts.showError,
        confirmDelete: opts.confirmDelete,
        customConfirmMessage: opts.customConfirmMessage
      })

      if (!result) {
        // Rollback comentado hasta implementar completamente
        // if (opts.optimistic) {
        //   // Restaurar datos originales
        // }
        return false
      }

      // Manejar página vacía o revalidación
      const newDataLength = pagination.data.length - 1

      if (newDataLength === 0 && pagination.currentPage > 1) {
        // Página vacía, ir a la página anterior
        pagination.goToPage(pagination.currentPage - 1)
      } else if (
        newDataLength < pagination.itemsPerPage &&
        pagination.totalItems - 1 > pagination.currentPage * pagination.itemsPerPage - pagination.itemsPerPage
      ) {
        // Hay más elementos disponibles - revalidar para llenar
        if (opts.revalidate) {
          pagination.refresh()
        }
      } else if (opts.revalidate) {
        // Revalidación normal
        pagination.refresh()
      }

      if (opts.showSuccess) {
        showSuccess(`${entityName} eliminado exitosamente`)
      }

      return true

    } catch (error) {
      // Rollback comentado hasta implementar completamente
      // if (opts.optimistic) {
      //   // Restaurar datos originales
      // }

      const message = error instanceof Error ? error.message : `Error al eliminar ${entityName.toLowerCase()}`
      setOperationError(message)
      if (opts.showError) {
        showError(message)
      }
      return false
    } finally {
      setOperationLoading(false)
    }
  }, [
    crud,
    pagination,
    optimisticUpdates,
    shouldConfirmDelete,
    entityName,
    showSuccess,
    showError
  ])

  /**
   * Aplicar filtros con reinicio a página 1
   */
  const applyFilters = useCallback((
    newFilters: Record<string, unknown>,
    resetPage: boolean = true
  ) => {
    setFilterSort(prev => ({
      ...prev,
      filters: newFilters
    }))

    if (resetPage && pagination.currentPage !== 1) {
      pagination.goToPage(1)
    }
  }, [pagination])

  /**
   * Manejar ordenamiento
   */
  const handleSort = useCallback((column: string) => {
    setFilterSort(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilterSort(prev => ({
      ...prev,
      filters: {}
    }))
  }, [])

  /**
   * Resetear ordenamiento a valores por defecto
   */
  const resetSort = useCallback(() => {
    setFilterSort(prev => ({
      ...prev,
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder
    }))
  }, [defaultSortBy, defaultSortOrder])

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    pagination.refresh()
  }, [pagination])

  return {
    // Datos de paginación
    data: pagination.data,
    loading: pagination.loading || operationLoading,
    error: pagination.error || operationError,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    hasNext: pagination.hasNext,
    hasPrevious: pagination.hasPrevious,

    // Operaciones CRUD
    createItem,
    updateItem,
    deleteItem,

    // Control de paginación
    goToPage: pagination.goToPage,
    setItemsPerPage: pagination.setItemsPerPage,
    refresh,

    // Filtros y ordenamiento
    filters: filterSort.filters,
    sortBy: filterSort.sortBy,
    sortOrder: filterSort.sortOrder,
    applyFilters,
    handleSort,
    clearFilters,
    resetSort,

    // Estados adicionales
    operationLoading,
    operationError,

    // Utilidades
    itemMatchesFilters,

    // Metadatos
    isEmpty: pagination.data.length === 0,
    isFirstPage: pagination.currentPage === 1,
    isLastPage: pagination.currentPage === pagination.totalPages,
    startItem: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
    endItem: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),

    // Acceso directo a hooks individuales para casos especiales
    pagination,
    crud
  }
}

/**
 * Factory para crear configuraciones CRUD con paginación
 */
export const createCrudPaginationConfig = <T extends { id?: number }>(
  entityName: string,
  fetchFunction: CrudPaginationConfig<T>['fetchFunction'],
  service: CrudService<T>,
  additionalConfig?: Partial<Omit<CrudPaginationConfig<T>, 'entityName' | 'fetchFunction' | 'service'>>
): CrudPaginationConfig<T> => ({
  entityName,
  fetchFunction,
  service,
  ...additionalConfig
})

/**
 * Hook de debounce para filtros
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para manejar filtros con debounce
 */
export const useDebouncedFilters = (
  initialFilters: Record<string, unknown> = {},
  delay: number = 300
) => {
  const [filters, setFilters] = useState(initialFilters)
  const debouncedFilters = useDebounce(filters, delay)

  const updateFilter = useCallback((key: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    filters,
    debouncedFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    setFilters
  }
}
