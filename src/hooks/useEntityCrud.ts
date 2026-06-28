import { PaginatedResponse } from '../types/PaginatedResponse'
import { useToast } from './useToast'

/** Operaciones CRUD que envuelve este hook (subconjunto de GenericService, sin filtros). */
export type CrudOps<T> = {
  getAllPaginated: (page: number, limit: number) => Promise<PaginatedResponse<T>>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string | number, data: Partial<T>) => Promise<T>
  updatePartial: (id: string | number, data: Partial<T>) => Promise<T>
  delete: (id: string | number, item?: T) => Promise<void>
}

/**
 * Hooks CRUD reutilizables para una página genérica. Envuelve create / update /
 * updatePartial / delete con toasts y manejo de error consistentes, y reexpone
 * `getAllPaginated` (posiblemente personalizado) desde el servicio recibido.
 *
 * Devuelve un `serviceHooksFactory` listo para pasar a `<GenericPage />`,
 * eliminando el boilerplate repetido en cada página de entidad.
 *
 * @param service  Servicio de la entidad (ej. `productService`).
 * @param label    Nombre legible en singular (ej. "Producto", "Usuario").
 */
export function useEntityCrud<T extends object>(
  service: CrudOps<T>,
  label: string,
): (svc: CrudOps<T>) => Partial<CrudOps<T>> {
  const { showSuccess } = useToast()

  return (svc: CrudOps<T>): Partial<CrudOps<T>> => ({
    getAllPaginated: svc.getAllPaginated.bind(svc),
    create: async (data) => {
      const created = await service.create(data)
      showSuccess(`${label} creado exitosamente`)
      return created
    },
    update: async (id, data) => {
      const updated = await service.update(id, data)
      showSuccess(`${label} actualizado`)
      return updated
    },
    updatePartial: async (id, data) => {
      const updated = await service.updatePartial(id, data)
      showSuccess(`${label} actualizado`)
      return updated
    },
    delete: async (id, item) => {
      await service.delete(id, item)
      showSuccess(`${label} eliminado`)
    },
  })
}
