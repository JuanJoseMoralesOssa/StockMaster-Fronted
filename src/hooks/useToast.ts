import { useCallback } from 'react'
import { ToastService } from '../services/ToastService'

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
  }
}
