import Swal from 'sweetalert2'

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
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
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
      timer: 4000, // Más tiempo para errores
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
    title: string = 'Confirmar eliminación'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
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
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
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

/**
 * Factory para crear notificaciones específicas del dominio
 * Principio Open/Closed: fácil extensión sin modificar ToastService
 */
export class NotificationFactory {
  /**
   * Notificaciones para operaciones de usuario
   */
  static readonly user = {
    created: () => ToastService.success('Usuario creado exitosamente'),
    updated: () => ToastService.success('Usuario actualizado exitosamente'),
    deleted: () => ToastService.success('Usuario eliminado exitosamente'),
    createError: (error?: string) => ToastService.error(error || 'Error al crear el usuario'),
    updateError: (error?: string) => ToastService.error(error || 'Error al actualizar el usuario'),
    deleteError: (error?: string) => ToastService.error(error || 'Error al eliminar el usuario'),
  }

  /**
   * Notificaciones para operaciones de productos
   */
  static readonly product = {
    created: () => ToastService.success('Producto creado exitosamente'),
    updated: () => ToastService.success('Producto actualizado exitosamente'),
    deleted: () => ToastService.success('Producto eliminado exitosamente'),
    createError: (error?: string) => ToastService.error(error || 'Error al crear el producto'),
    updateError: (error?: string) => ToastService.error(error || 'Error al actualizar el producto'),
    deleteError: (error?: string) => ToastService.error(error || 'Error al eliminar el producto'),
  }

  /**
   * Notificaciones para operaciones de compras
   */
  static readonly purchase = {
    created: () => ToastService.success('Compra creada exitosamente'),
    updated: () => ToastService.success('Compra actualizada exitosamente'),
    deleted: () => ToastService.success('Compra eliminada exitosamente'),
    createError: (error?: string) => ToastService.error(error || 'Error al crear la compra'),
    updateError: (error?: string) => ToastService.error(error || 'Error al actualizar la compra'),
    deleteError: (error?: string) => ToastService.error(error || 'Error al eliminar la compra'),
    missingId: () => ToastService.error('Error al editar la compra: ID no definido'),
    missingDate: () => ToastService.error('Error al editar la compra: Fecha no definida'),
    invalidDetails: () => ToastService.error('Error al editar la compra: Producto o persona indefinida en detalle'),
  }

  /**
   * Notificaciones para operaciones de proveedores
   */
  static readonly supplier = {
    created: () => ToastService.success('Proveedor creado exitosamente'),
    updated: () => ToastService.success('Proveedor actualizado exitosamente'),
    deleted: () => ToastService.success('Proveedor eliminado exitosamente'),
    createError: (error?: string) => ToastService.error(error || 'Error al crear el proveedor'),
    updateError: (error?: string) => ToastService.error(error || 'Error al actualizar el proveedor'),
    deleteError: (error?: string) => ToastService.error(error || 'Error al eliminar el proveedor'),
  }

  /**
   * Notificaciones para operaciones de kardex
   */
  static readonly kardex = {
    created: () => ToastService.success('Registro de kardex creado exitosamente'),
    updated: () => ToastService.success('Registro de kardex actualizado exitosamente'),
    deleted: () => ToastService.success('Registro de kardex eliminado exitosamente'),
    createError: (error?: string) => ToastService.error(error || 'Error al crear el registro del kardex'),
    updateError: (error?: string) => ToastService.error(error || 'Error al actualizar el kardex'),
    deleteError: (error?: string) => ToastService.error(error || 'Error al eliminar el registro del kardex'),
  }

  /**
   * Notificaciones para autenticación
   */
  static readonly auth = {
    loginSuccess: () => ToastService.success('Inicio de sesión exitoso'),
    loginError: () => ToastService.error('Credenciales incorrectas'),
    logoutSuccess: () => ToastService.success('Sesión cerrada exitosamente'),
    sessionExpired: () => ToastService.warning('Su sesión ha expirado'),
    unauthorized: () => ToastService.error('No tiene permisos para realizar esta acción'),
  }

  /**
   * Notificaciones genéricas
   */
  static readonly generic = {
    loading: (message?: string) => ToastService.loading(message),
    networkError: () => ToastService.error('Error de conexión. Verifique su conexión a internet'),
    unexpectedError: () => ToastService.error('Ha ocurrido un error inesperado'),
    actionCancelled: () => ToastService.info('Acción cancelada'),
    dataRefreshed: () => ToastService.success('Datos actualizados'),
  }
}
