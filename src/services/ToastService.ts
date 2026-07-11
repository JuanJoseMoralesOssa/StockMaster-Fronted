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
 * Servicio centralizado para las notificaciones de la app.
 */
export class ToastService {
  static success(message: string, title: string = '¡Éxito!'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'success',
      title,
      text: message,
    })
  }

  /** El error no se auto-cierra: el usuario debe poder leerlo y actuar. */
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

  static warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
      ...TOAST_CONFIG,
      icon: 'warning',
      title,
      text: message,
    })
  }

  /** Confirmación para acciones destructivas. Resuelve a `true` si el usuario acepta. */
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
}
