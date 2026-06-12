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
  /** Alineación del contenido. Los números van a la derecha, texto a la izquierda (default) */
  align?: 'left' | 'right'
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
export interface GenericField<T = object> {
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
  validate?: (value: unknown, formData: Partial<T>) => string | undefined
  /** Opciones para select */
  options?: Array<{ value: string | number; label: string }>
  /** Valor por defecto */
  defaultValue?: unknown
  /** Si el campo es de solo lectura */
  readOnly?: boolean
  /** Si el campo está deshabilitado */
  disabled?: boolean
  /** Ocultar el campo en el formulario de edición (solo aplica al crear) */
  hideOnEdit?: boolean
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
export interface GenericPageConfig<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  /** Nombre de la entidad en singular */
  entityName: string
  /** Nombre de la entidad en plural */
  entityNamePlural: string
  /** Campo que se usa como ID */
  idField: keyof T
  /** Configuración de las columnas de la tabla */
  columns: GenericColumn<T>[]
  /** Clases CSS condicionales por fila */
  rowClassName?: (item: T) => string
  /** Configuración de los campos del formulario */
  formFields: GenericField<T>[]
  /** Configuración de las acciones */
  actions?: GenericActions<T>
  /** Servicio para operaciones CRUD */
  service: {
    getAllPaginated: (page: number, limit: number) => Promise<PaginatedResponse<T>>
    create: (data: CreateInput) => Promise<T>
    update: (id: string | number, data: UpdateInput) => Promise<T>
    updatePartial: (id: string | number, data: Partial<UpdateInput>) => Promise<T>
    delete: (id: string | number) => Promise<void>
    getAllPaginatedFiltered?: (filters: TFilter, page?: number, limit?: number) => Promise<PaginatedResponse<T>>
  }

  updatePartial?: boolean
  /** Estado inicial de los filtros */
  initialFilterState?: TFilter
  /** Estado al limpiar filtros; si no se define usa initialFilterState */
  clearFilterState?: TFilter
  /** Si los filtros iniciales deben ejecutarse en la primera carga */
  initialFiltersActive?: boolean
  /** Renderizado personalizado de filtros */
  renderCustomFilters?: (props: {
    filters: TFilter
    setFilters: (filters: TFilter) => void
    onSearch: () => void
    onClear: () => void
    loading: boolean
  }) => ReactNode
  /** Configuración para la vista de detalles */
  detailConfig?: {
    /** Título del modal de detalles */
    title?: string | ((item: T) => string)
    /** Descripción del modal de detalles */
    description?: string
    /** Renderizado del contenido de detalles */
    renderContent: (item: T) => ReactNode
  }
  /** Configuración para filas expandibles */
  expandableConfig?: {
    /** Renderizado del contenido expandido */
    renderExpandedContent: (item: T) => ReactNode
    /** Título opcional para la sección expandida */
    expandedTitle?: (item: T) => string
  }
  /** Renderizado personalizado para el formulario de crear */
  renderCustomForm?: (onSuccess: () => void, onItemCreated: (item: T) => void) => ReactNode
  /** Clase CSS opcional para el ancho/layout del modal de crear y editar */
  modalClassName?: string
  /** Función para obtener un item completo (con relaciones) antes de abrir el modal de edición */
  fetchForEdit?: (id: string | number) => Promise<T>
  /** Renderizado personalizado para el formulario de editar */
  renderEditForm?: (item: T, onSuccess: () => void, onItemUpdated: (item: T) => void) => ReactNode
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
  /** Acciones extra que se muestran junto al botón de crear en el header (ej: botón Escanear) */
  renderHeaderActions?: () => ReactNode
}
