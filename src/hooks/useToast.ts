import { useCallback } from 'react'
import { ToastService } from '../services/ToastService'

/**
 * Envuelve ToastService en callbacks estables para que los componentes puedan
 * ponerlos en dependencias de efectos sin recrearlos en cada render.
 */
export const useToast = () => {
  const showSuccess = useCallback((message: string, title?: string) => {
    ToastService.success(message, title)
  }, [])

  const showError = useCallback((message: string, title?: string) => {
    ToastService.error(message, title)
  }, [])

  const showWarning = useCallback((message: string, title?: string) => {
    ToastService.warning(message, title)
  }, [])

  const confirmDelete = useCallback(async (message?: string, title?: string, confirmText?: string) => {
    return await ToastService.confirmDelete(message, title, confirmText)
  }, [])

  return {
    showSuccess,
    showError,
    showWarning,
    confirmDelete,
  }
}
