import { ReactNode } from "react"
import { PaginatedResponse } from "./PaginatedResponse"

/**
 * Configuración para una columna de tabla genérica
 */
export interface GenericColumn<T> {
  /** Clave del campo en los datos */
  key: keyof T | string
  /** Título que se mostrará en el header */
  label: string
  /** Función personalizada para renderizar la celda */
  render?: (item: T) => ReactNode
  /** Si la columna es sorteable */
  sortable?: boolean
  /** Ancho de la columna (Tailwind classes) */
  width?: string
  /** Ocultar en pantallas pequeñas */
  hideOnMobile?: boolean
}

/**
 * Configuración para las acciones de la tabla
 */
export interface GenericActions<T> {
  /** Mostrar botón de editar */
  canEdit?: boolean
  /** Mostrar botón de eliminar */
  canDelete?: boolean
  /** Acciones personalizadas adicionales */
  customActions?: Array<{
    icon: ReactNode
    label: string
    onClick: (item: T) => void
    className?: string
    condition?: (item: T) => boolean // Mostrar acción solo si se cumple condición
  }>
}

/**
 * Configuración para un campo de formulario genérico
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericField<T = any> {
  /** Nombre del campo */
  name: keyof T
  /** Label del campo */
  label: string
  /** Tipo de input */
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox'
  /** Placeholder */
  placeholder?: string
  /** Si el campo es requerido */
  required?: boolean
  /** Validación personalizada */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate?: (value: any, formData: Partial<T>) => string | undefined
  /** Opciones para select */
  options?: Array<{ value: string | number; label: string }>
  /** Valor por defecto */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any
  /** Si el campo es de solo lectura */
  readOnly?: boolean
  /** Si el campo está deshabilitado */
  disabled?: boolean
  /** Mostrar/ocultar contraseña */
  showPasswordToggle?: boolean
  /** Número mínimo (para type number) */
  min?: number
  /** Número máximo (para type number) */
  max?: number
  /** Paso (para type number) */
  step?: number
  /** Clases CSS adicionales */
  className?: string
}

/**
 * Configuración completa para una página genérica
 */
export interface GenericPageConfig<T> {
  /** Nombre de la entidad en singular */
  entityName: string
  /** Nombre de la entidad en plural */
  entityNamePlural: string
  /** Campo que se usa como ID */
  idField: keyof T
  /** Configuración de las columnas de la tabla */
  columns: GenericColumn<T>[]
  /** Configuración de los campos del formulario */
  formFields: GenericField<T>[]
  /** Configuración de las acciones */
  actions?: GenericActions<T>
  /** Servicio para operaciones CRUD */
  service: {
    getAllPaginated: (page: number, limit: number) => Promise<PaginatedResponse<T>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (data: any) => Promise<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (id: any, data: Partial<T>) => Promise<T>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: (id: any) => Promise<void>
  }
  /** Función para preparar datos antes de enviar (ej: hash passwords) */
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
  /** Función para validar datos personalizados */
  validateData?: (data: Partial<T>) => Promise<string | undefined>
  /** Mensaje de éxito al crear */
  createSuccessMessage?: string
  /** Mensaje de éxito al actualizar */
  updateSuccessMessage?: string
  /** Mensaje de éxito al eliminar */
  deleteSuccessMessage?: string
  /** Renderizado personalizado para el botón de crear */
  renderCreateButton?: (onClick: () => void) => ReactNode
  /** Filtros adicionales para la tabla */
  filters?: Array<{
    name: string
    label: string
    type: 'text' | 'select' | 'date'
    options?: Array<{ value: string; label: string }>
  }>
}
