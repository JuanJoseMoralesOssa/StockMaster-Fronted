import { useCallback } from 'react'
import { ToastService, NotificationFactory } from '../services/ToastService'

/**
 * Hook personalizado para manejar notificaciones
 * Facilita el uso de toasts en componentes React
 */
export const useToast = () => {
  // Métodos básicos del ToastService
  const showSuccess = useCallback((message: string, title?: string) => {
    ToastService.success(message, title)
  }, [])

  const showError = useCallback((message: string, title?: string) => {
    ToastService.error(message, title)
  }, [])

  const showWarning = useCallback((message: string, title?: string) => {
    ToastService.warning(message, title)
  }, [])

  const showInfo = useCallback((message: string, title?: string) => {
    ToastService.info(message, title)
  }, [])

  const showLoading = useCallback((message?: string) => {
    ToastService.loading(message)
  }, [])

  const close = useCallback(() => {
    ToastService.close()
  }, [])

  // Métodos de confirmación
  const confirmDelete = useCallback(async (message?: string, title?: string, confirmText?: string) => {
    return await ToastService.confirmDelete(message, title, confirmText)
  }, [])

  const confirm = useCallback(async (
    message: string,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => {
    return await ToastService.confirm(message, title, confirmText, cancelText)
  }, [])

  // Método para manejar errores de operaciones async
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage?: string,
    loadingMessage?: string
  ): Promise<T | null> => {
    try {
      if (loadingMessage) {
        showLoading(loadingMessage)
      }

      const result = await operation()

      close()
      showSuccess(successMessage)

      return result
    } catch (error) {
      close()
      const message = error instanceof Error ? error.message : errorMessage || 'Ha ocurrido un error'
      showError(message)

      return null
    }
  }, [showLoading, close, showSuccess, showError])

  return {
    // Métodos básicos
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    close,

    // Métodos de confirmación
    confirmDelete,
    confirm,

    // Utilidades
    handleAsyncOperation,

    // Acceso directo a las notificaciones del factory
    notifications: NotificationFactory,

    // Acceso directo al servicio completo
    toast: ToastService,
  }
}

/**
 * Hook específico para operaciones CRUD
 * Simplifica el manejo de notificaciones para operaciones comunes
 */
export const useCrudToast = () => {
  const { handleAsyncOperation, confirmDelete } = useToast()

  const handleCreate = useCallback(async <T>(
    operation: () => Promise<T>,
    entityName: string = 'elemento'
  ): Promise<T | null> => {
    return handleAsyncOperation(
      operation,
      `${entityName} creado exitosamente`,
      `Error al crear ${entityName.toLowerCase()}`,
      `Creando ${entityName.toLowerCase()}...`
    )
  }, [handleAsyncOperation])

  const handleUpdate = useCallback(async <T>(
    operation: () => Promise<T>,
    entityName: string = 'elemento'
  ): Promise<T | null> => {
    return handleAsyncOperation(
      operation,
      `${entityName} actualizado exitosamente`,
      `Error al actualizar ${entityName.toLowerCase()}`,
      `Actualizando ${entityName.toLowerCase()}...`
    )
  }, [handleAsyncOperation])

  const handleDelete = useCallback(async <T>(
    operation: () => Promise<T>,
    entityName: string = 'elemento',
    confirmMessage?: string
  ): Promise<T | null> => {
    const confirmed = await confirmDelete(
      confirmMessage || `¿Estás seguro de que quieres eliminar este ${entityName.toLowerCase()}?`
    )

    if (!confirmed) {
      return null
    }

    return handleAsyncOperation(
      operation,
      `${entityName} eliminado exitosamente`,
      `Error al eliminar ${entityName.toLowerCase()}`,
      `Eliminando ${entityName.toLowerCase()}...`
    )
  }, [handleAsyncOperation, confirmDelete])

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
