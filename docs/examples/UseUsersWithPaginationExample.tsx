import React, { useEffect } from 'react'
import { useCrudWithPagination, createCrudPaginationConfig, useDebouncedFilters } from '../hooks/useCrudWithPagination'
import { userService } from '../services/User'
import User from '../types/User'

/**
 * Hook específico para manejar usuarios con paginación y CRUD
 * Ejemplo práctico de cómo usar useCrudWithPagination
 */
export const useUsersWithPagination = () => {
  // Configuración específica para usuarios
  const config = createCrudPaginationConfig(
    'Usuario',
    // Función de fetch que maneja filtros y ordenamiento
    async (page: number, limit: number, filters?: Record<string, unknown>, sortBy = 'createdAt', sortOrder = 'desc') => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      }

      // Agregar filtros si existen
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params[key] = value.toString()
          }
        })
      }

      return userService.getPaginated(page, limit)
    },
    userService,
    {
      // Validaciones específicas para usuarios
      validations: {
        create: (user: User) => {
          if (!user.name?.trim()) {
            throw new Error('El nombre es requerido')
          }
          if (!user.email?.trim()) {
            throw new Error('El email es requerido')
          }
          if (!user.email.includes('@')) {
            throw new Error('El email debe ser válido')
          }
        },
        update: (user: User) => {
          if (!user.id) {
            throw new Error('ID de usuario requerido para actualizar')
          }
          if (!user.name?.trim()) {
            throw new Error('El nombre es requerido')
          }
          if (!user.email?.trim()) {
            throw new Error('El email es requerido')
          }
          if (!user.email.includes('@')) {
            throw new Error('El email debe ser válido')
          }
        },
        delete: async (_id: number) => {
          // Verificar si el usuario tiene dependencias
          // const hasDependencies = await checkUserDependencies(id)
          // if (hasDependencies) {
          //   throw new Error('No se puede eliminar el usuario porque tiene datos asociados')
          // }
        }
      },
      // Mensajes personalizados
      customMessages: {
        created: 'Usuario creado exitosamente',
        updated: 'Usuario actualizado exitosamente',
        deleted: 'Usuario eliminado exitosamente',
        deleteConfirm: '¿Estás seguro de que quieres eliminar este usuario?'
      },
      // Opciones específicas
      options: {
        autoRefresh: false,
        optimisticUpdates: true,
        confirmDelete: true,
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'desc',
        defaultPageSize: 10
      }
    }
  )

  // Hook principal con toda la funcionalidad
  const usersCrud = useCrudWithPagination<User>(config)

  // Filtros con debounce para mejor UX
  const {
    filters: rawFilters,
    debouncedFilters,
    updateFilter,
    clearFilter,
    clearAllFilters
  } = useDebouncedFilters({
    name: '',
    email: '',
    role: ''
  }, 300)

  // Aplicar filtros debounced cuando cambien
  useEffect(() => {
    usersCrud.applyFilters(debouncedFilters)
  }, [debouncedFilters, usersCrud.applyFilters])

  // Funciones específicas de negocio para usuarios
  const createUser = async (userData: Omit<User, 'id'>) => {
    return usersCrud.createItem(userData as User, {
      goToFirstPage: true, // Ir a la primera página después de crear
      revalidate: true
    })
  }

  const updateUser = async (user: User) => {
    return usersCrud.updateItem(user, {
      revalidate: true // Revalidar para ver cambios de orden si aplica
    })
  }

  const deleteUser = async (id: number | string) => {
    return usersCrud.deleteItem(id, undefined, {
      customConfirmMessage: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.'
    })
  }

  // Función para exportar usuarios (ejemplo de operación adicional)
  const exportUsers = async () => {
    try {
      const allUsers = await userService.getAll()
      // Lógica de exportación
      console.log('Exportando usuarios:', allUsers)
      return allUsers
    } catch (error) {
      console.error('Error al exportar usuarios:', error)
      throw error
    }
  }

  // Función para resetear password (ejemplo de operación específica)
  const resetUserPassword = async (_userId: number) => {
    try {
      // Lógica específica para resetear password
      // await userService.resetPassword(userId)
      usersCrud.refresh() // Refrescar datos después de la operación
      return true
    } catch (error) {
      console.error('Error al resetear password:', error)
      throw error
    }
  }

  return {
    // Datos y estado de paginación
    users: usersCrud.data,
    loading: usersCrud.loading,
    error: usersCrud.error,

    // Información de paginación
    currentPage: usersCrud.currentPage,
    totalPages: usersCrud.totalPages,
    totalItems: usersCrud.totalItems,
    itemsPerPage: usersCrud.itemsPerPage,
    hasNext: usersCrud.hasNext,
    hasPrevious: usersCrud.hasPrevious,
    isEmpty: usersCrud.isEmpty,
    isFirstPage: usersCrud.isFirstPage,
    isLastPage: usersCrud.isLastPage,
    startItem: usersCrud.startItem,
    endItem: usersCrud.endItem,

    // Operaciones CRUD
    createUser,
    updateUser,
    deleteUser,

    // Control de paginación
    goToPage: usersCrud.goToPage,
    setItemsPerPage: usersCrud.setItemsPerPage,
    refresh: usersCrud.refresh,

    // Filtros y búsqueda
    filters: rawFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,

    // Ordenamiento
    sortBy: usersCrud.sortBy,
    sortOrder: usersCrud.sortOrder,
    handleSort: usersCrud.handleSort,
    resetSort: usersCrud.resetSort,

    // Estados adicionales
    operationLoading: usersCrud.operationLoading,
    operationError: usersCrud.operationError,

    // Operaciones adicionales específicas del negocio
    exportUsers,
    resetUserPassword,

    // Utilidades
    itemMatchesFilters: usersCrud.itemMatchesFilters
  }
}
