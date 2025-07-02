import { useCallback, useMemo } from 'react'
import { useToast } from './useToast'

/**
 * Configuración para operaciones CRUD
 */
interface CrudConfig<T> {
  entityName: string
  service: CrudService<T>
  validations?: CrudValidations<T>
  customMessages?: Partial<CrudMessages>
}

/**
 * Interfaz genérica para servicios CRUD
 */
export interface CrudService<T> {
  create: (data: T) => Promise<T>
  update: (data: T) => Promise<T>
  delete: (id: number) => Promise<void>
  getById?: (id: number) => Promise<T | null>
}

/**
 * Validaciones personalizadas para operaciones CRUD
 */
interface CrudValidations<T> {
  create?: (data: T) => Promise<void> | void
  update?: (data: T) => Promise<void> | void
  delete?: (id: number, data?: T) => Promise<void> | void
}

/**
 * Mensajes personalizables para operaciones CRUD
 */
interface CrudMessages {
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
}

/**
 * Opciones para operaciones CRUD
 */
interface CrudOperationOptions {
  showLoading?: boolean
  showSuccess?: boolean
  showError?: boolean
  confirmDelete?: boolean
  customConfirmMessage?: string
}

/**
 * Hook genérico para operaciones CRUD con validaciones y manejo de errores
 * Respeta el principio de responsabilidad única (SRP)
 */
export const useCrudOperations = <T extends { id?: number }>(config: CrudConfig<T>) => {
  const { showLoading, showSuccess, showError, confirmDelete, close } = useToast()

  const { entityName, service, validations, customMessages } = config

  // Mensajes memoizados para evitar re-renders innecesarios
  const messages: CrudMessages = useMemo(() => ({
    creating: `Creando ${entityName.toLowerCase()}...`,
    created: `${entityName} creado exitosamente`,
    createError: `Error al crear ${entityName.toLowerCase()}`,
    updating: `Actualizando ${entityName.toLowerCase()}...`,
    updated: `${entityName} actualizado exitosamente`,
    updateError: `Error al actualizar ${entityName.toLowerCase()}`,
    deleting: `Eliminando ${entityName.toLowerCase()}...`,
    deleted: `${entityName} eliminado exitosamente`,
    deleteError: `Error al eliminar ${entityName.toLowerCase()}`,
    deleteConfirm: `¿Estás seguro de que quieres eliminar este ${entityName.toLowerCase()}?`,
    ...customMessages
  }), [entityName, customMessages])

  /**
   * Operación genérica de creación
   */
  const create = useCallback(async (
    data: T,
    options: CrudOperationOptions = {}
  ): Promise<T | null> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      ...options
    }

    try {
      // Validaciones personalizadas
      if (validations?.create) {
        await validations.create(data)
      }

      if (opts.showLoading) {
        showLoading(messages.creating)
      }

      const result = await service.create(data)

      if (opts.showLoading) {
        close()
      }

      if (opts.showSuccess) {
        showSuccess(messages.created)
      }

      return result

    } catch (error) {
      if (opts.showLoading) {
        close()
      }

      if (opts.showError) {
        const message = error instanceof Error ? error.message : messages.createError
        showError(message)
      }

      return null
    }
  }, [service, validations, messages, showLoading, showSuccess, showError, close])

  /**
   * Operación genérica de actualización
   */
  const update = useCallback(async (
    data: T,
    options: CrudOperationOptions = {}
  ): Promise<T | null> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      ...options
    }

    try {
      // Validaciones personalizadas
      if (validations?.update) {
        await validations.update(data)
      }

      if (opts.showLoading) {
        showLoading(messages.updating)
      }

      const result = await service.update(data)

      if (opts.showLoading) {
        close()
      }

      if (opts.showSuccess) {
        showSuccess(messages.updated)
      }

      return result

    } catch (error) {
      if (opts.showLoading) {
        close()
      }

      if (opts.showError) {
        const message = error instanceof Error ? error.message : messages.updateError
        showError(message)
      }

      return null
    }
  }, [service, validations, messages, showLoading, showSuccess, showError, close])

  /**
   * Operación genérica de eliminación
   */
  const deleteEntity = useCallback(async (
    id: number,
    data?: T,
    options: CrudOperationOptions = {}
  ): Promise<boolean> => {
    const opts = {
      showLoading: true,
      showSuccess: true,
      showError: true,
      confirmDelete: true,
      ...options
    }

    try {
      // Validaciones personalizadas
      if (validations?.delete) {
        await validations.delete(id, data)
      }

      // Confirmación de eliminación
      if (opts.confirmDelete) {
        const confirmMessage = opts.customConfirmMessage || messages.deleteConfirm
        const confirmed = await confirmDelete(confirmMessage)
        if (!confirmed) {
          return false
        }
      }

      if (opts.showLoading) {
        showLoading(messages.deleting)
      }

      await service.delete(id)

      if (opts.showLoading) {
        close()
      }

      if (opts.showSuccess) {
        showSuccess(messages.deleted)
      }

      return true

    } catch (error) {
      if (opts.showLoading) {
        close()
      }

      if (opts.showError) {
        const message = error instanceof Error ? error.message : messages.deleteError
        showError(message)
      }

      return false
    }
  }, [service, validations, messages, showLoading, showSuccess, showError, confirmDelete, close])

  /**
   * Operación genérica asíncrona con manejo de errores
   */
  const executeOperation = useCallback(async <R>(
    operation: () => Promise<R>,
    loadingMessage?: string,
    successMessage?: string,
    errorMessage?: string
  ): Promise<R | null> => {
    try {
      if (loadingMessage) {
        showLoading(loadingMessage)
      }

      const result = await operation()

      if (loadingMessage) {
        close()
      }

      if (successMessage) {
        showSuccess(successMessage)
      }

      return result

    } catch (error) {
      if (loadingMessage) {
        close()
      }

      const message = error instanceof Error ? error.message : errorMessage || 'Error en la operación'
      showError(message)

      return null
    }
  }, [showLoading, showSuccess, showError, close])

  return {
    create,
    update,
    delete: deleteEntity,
    executeOperation,
    // Acceso directo a métodos de toast para casos especiales
    toast: {
      showLoading,
      showSuccess,
      showError,
      confirmDelete,
      close
    }
  }
}

/**
 * Factory para crear configuraciones CRUD comunes
 */
export const createCrudConfig = <T extends { id?: number }>(
  entityName: string,
  service: CrudService<T>,
  validations?: CrudValidations<T>,
  customMessages?: Partial<CrudMessages>
): CrudConfig<T> => ({
  entityName,
  service,
  validations,
  customMessages
})
