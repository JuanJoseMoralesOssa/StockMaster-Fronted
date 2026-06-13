import { useApiRequest } from './useApiRequest'
import { PaginatedResponse } from '../types/PaginatedResponse'

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
  const lower = label.toLowerCase()

  const createReq = useApiRequest<T, [Partial<T>]>((data) => service.create(data), {
    successMessage: `${label} creado exitosamente`,
    showSuccessToast: true,
  })
  const updateReq = useApiRequest<T, [number | string, Partial<T>]>(
    (id, data) => service.update(id, data),
    { successMessage: `${label} actualizado`, showSuccessToast: true },
  )
  const updatePartialReq = useApiRequest<T, [number | string, Partial<T>]>(
    (id, data) => service.updatePartial(id, data),
    { successMessage: `${label} actualizado`, showSuccessToast: true },
  )
  const deleteReq = useApiRequest<void, [number | string, T | undefined]>((id, item) => service.delete(id, item), {
    successMessage: `${label} eliminado`,
    showSuccessToast: true,
  })

  return (svc: CrudOps<T>): Partial<CrudOps<T>> => ({
    getAllPaginated: svc.getAllPaginated.bind(svc),
    create: async (data) => {
      const res = await createReq.execute(data)
      if (!res) throw new Error(`No se pudo crear el ${lower}`)
      return res
    },
    update: async (id, data) => {
      const res = await updateReq.execute(id, data)
      if (!res) throw new Error(`No se pudo actualizar el ${lower}`)
      return res
    },
    updatePartial: async (id, data) => {
      const res = await updatePartialReq.execute(id, data)
      if (!res) throw new Error(`No se pudo actualizar el ${lower}`)
      return res
    },
    delete: async (id, item) => {
      const res = await deleteReq.execute(id, item)
      if (res === null) throw new Error(`No se pudo eliminar el ${lower}`)
    },
  })
}
