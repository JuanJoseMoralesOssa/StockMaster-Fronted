import Swal from 'sweetalert2'

/**
 * Lee un design token del :root para mantener los botones de SweetAlert2
 * alineados con la paleta OKLCH del proyecto (con fallback para SSR/tests).
 */
function token(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/**
 * Posiciones disponibles para los toasts
 */
export type ToastPosition = 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'

/**
 * Configuración base para los toasts
 */
const TOAST_CONFIG = {
  toast: true,
  position: 'top-end' as const,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast: HTMLElement) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
}

/**
 * Tipos de toast disponibles
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Interfaz para opciones de toast personalizadas
 */
export interface ToastOptions {
  title?: string
  message: string
  type?: ToastType
  duration?: number
  showProgressBar?: boolean
  position?: ToastPosition
}

/**
 * Servicio centralizado para manejo de notificaciones toast
 * Sigue el principio de Single Responsibility Pattern
 */
export class ToastService {
  /**
   * Muestra un toast de éxito
   */
  static success(message: string, title: string = '¡Éxito!'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'success',
      title,
      text: message,
    })
  }

  /**
   * Muestra un toast de error
   */
  static error(message: string, title: string = 'Error'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'error',
      title,
      text: message,
      timer: undefined,
      timerProgressBar: false,
      showCloseButton: true,
    })
  }

  /**
   * Muestra un toast de advertencia
   */
  static warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'warning',
      title,
      text: message,
    })
  }

  /**
   * Muestra un toast informativo
   */
  static info(message: string, title: string = 'Información'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'info',
      title,
      text: message,
    })
  }

  /**
   * Muestra un toast personalizado
   */
  static custom(options: ToastOptions): void {
    const {
      title,
      message,
      type = ToastType.INFO,
      duration = 3000,
      showProgressBar = true,
      position = 'top-end'
    } = options

    Swal.fire({
      ...TOAST_CONFIG,
      icon: type,
      title,
      text: message,
      timer: duration,
      timerProgressBar: showProgressBar,
      position,
    })
  }

  /**
   * Muestra un toast de confirmación para acciones destructivas
   */
  static async confirmDelete(
    message: string = '¿Estás seguro de que quieres eliminar este elemento?',
    title: string = 'Confirmar eliminación',
    confirmText: string = 'Eliminar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      html: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: token('--color-danger-500', '#ef4444'),
      cancelButtonColor: token('--color-text-secondary', '#6b7280'),
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })

    return result.isConfirmed
  }

  /**
   * Muestra un toast de confirmación genérico
   */
  static async confirm(
    message: string,
    title: string = 'Confirmar acción',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: token('--color-action-bg', '#3b82f6'),
      cancelButtonColor: token('--color-text-secondary', '#6b7280'),
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    })

    return result.isConfirmed
  }

  /**
   * Muestra un toast de carga
   */
  static loading(message: string = 'Cargando...'): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  /**
   * Cierra el toast actual
   */
  static close(): void {
    Swal.close()
  }
}
