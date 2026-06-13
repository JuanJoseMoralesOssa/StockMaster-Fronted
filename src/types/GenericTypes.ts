import { PaginatedResponse } from './PaginatedResponse'

export type GenericService<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> = {
  getAllPaginated: (page: number, limit: number) => Promise<PaginatedResponse<T>>
  create: (data: CreateInput) => Promise<T>
  update: (id: string | number, data: UpdateInput) => Promise<T>
  updatePartial: (id: string | number, data: Partial<UpdateInput>) => Promise<T>
  /**
   * `item` es la fila tal como está cargada en la tabla. Los documentos con
   * bloqueo optimista (compras/gastos) la necesitan para enviar su `version`
   * al backend: DELETE sin version responde 400, y una version obsoleta 409.
   */
  delete: (id: string | number, item?: T) => Promise<void>
  getAllPaginatedFiltered?: (filters: TFilter, page?: number, limit?: number) => Promise<PaginatedResponse<T>>
}

export interface PageContextValue<T, TFilter = object> {
  data: T[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  filters: TFilter
  setFilters: (filters: TFilter) => void
  goToPage: (page: number) => void
  setItemsPerPage: (limit: number) => void
  refresh: () => void
  refreshWithFilters: (filters: TFilter) => Promise<unknown>
  setActiveFilters: (active: boolean) => void
  applyFilters: () => void
  clearFilters: () => void
  addItem: (item: T) => void
  updateItem: (item: T, idField?: keyof T) => void
  removeItem: (id: string | number, idField?: keyof T) => void
  retry?: () => Promise<unknown>

  handleCreate: (formData: Partial<T>) => Promise<T>
  handleUpdate: (id: number | string, formData: Partial<T>) => Promise<T>
  handleDelete: (id: number | string, item?: T) => Promise<void>

  selectedItemForDetail: T | null
  setSelectedItemForDetail: (item: T | null) => void
}
