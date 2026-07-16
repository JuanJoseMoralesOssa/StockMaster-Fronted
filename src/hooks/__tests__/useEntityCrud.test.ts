// @vitest-environment jsdom
/**
 * Pruebas de useEntityCrud: envoltura de create/update/updatePartial/delete
 * con toasts de éxito, y reexposición de getAllPaginated conservando el
 * `this` del servicio recibido por la factory.
 */
import { renderHook } from '@testing-library/react'
import { PaginatedResponse } from '../../types/PaginatedResponse'
import { CrudOps, useEntityCrud } from '../useEntityCrud'

const showSuccess = vi.fn()

vi.mock('../useToast', () => ({
  useToast: () => ({ showSuccess, showError: vi.fn(), showWarning: vi.fn(), confirmDelete: vi.fn() }),
}))

type Item = { id: number; name: string }

type Call = { method: string; args: unknown[] }

/**
 * Servicio fake que registra cada llamada y, en getAllPaginated, devuelve su
 * propio `token` de instancia leído vía `this` — así una prueba puede
 * distinguir si el método corrió con el `this` correcto (bind) o no
 * (`this` sería `undefined` en modo estricto y lanzaría TypeError).
 */
class FakeService implements CrudOps<Item> {
  calls: Call[] = []
  constructor(public token: string) {}

  async getAllPaginated(page: number, limit: number): Promise<PaginatedResponse<Item> & { token: string }> {
    this.calls.push({ method: 'getAllPaginated', args: [page, limit] })
    return { data: [], page, limit, count: 0, totalPages: 1, hasNext: false, hasPrevious: false, token: this.token }
  }

  async create(data: Partial<Item>): Promise<Item> {
    this.calls.push({ method: 'create', args: [data] })
    return { id: 1, name: 'nuevo', ...data }
  }

  async update(id: string | number, data: Partial<Item>): Promise<Item> {
    this.calls.push({ method: 'update', args: [id, data] })
    return { id: Number(id), name: 'actualizado', ...data }
  }

  async updatePartial(id: string | number, data: Partial<Item>): Promise<Item> {
    this.calls.push({ method: 'updatePartial', args: [id, data] })
    return { id: Number(id), name: 'parcial', ...data }
  }

  async delete(id: string | number, item?: Item): Promise<void> {
    this.calls.push({ method: 'delete', args: [id, item] })
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useEntityCrud', () => {
  it('create delega en el service, muestra el toast y devuelve el resultado', async () => {
    const service = new FakeService('base')
    const { result } = renderHook(() => useEntityCrud(service, 'Producto'))
    const wrapped = result.current(service)

    const created = await wrapped.create!({ name: 'Tornillo' })

    expect(service.calls).toEqual([{ method: 'create', args: [{ name: 'Tornillo' }] }])
    expect(showSuccess).toHaveBeenCalledWith('Producto creado exitosamente')
    expect(created).toEqual({ id: 1, name: 'Tornillo' })
  })

  it('update delega en el service con id y data, y muestra "actualizado"', async () => {
    const service = new FakeService('base')
    const { result } = renderHook(() => useEntityCrud(service, 'Usuario'))
    const wrapped = result.current(service)

    const updated = await wrapped.update!(7, { name: 'Ana' })

    expect(service.calls).toEqual([{ method: 'update', args: [7, { name: 'Ana' }] }])
    expect(showSuccess).toHaveBeenCalledWith('Usuario actualizado')
    expect(updated).toEqual({ id: 7, name: 'Ana' })
  })

  it('updatePartial delega en el service con id y data, y muestra "actualizado"', async () => {
    const service = new FakeService('base')
    const { result } = renderHook(() => useEntityCrud(service, 'Usuario'))
    const wrapped = result.current(service)

    const patched = await wrapped.updatePartial!(3, { name: 'Beto' })

    expect(service.calls).toEqual([{ method: 'updatePartial', args: [3, { name: 'Beto' }] }])
    expect(showSuccess).toHaveBeenCalledWith('Usuario actualizado')
    expect(patched).toEqual({ id: 3, name: 'Beto' })
  })

  it('delete delega en el service con id e item opcional, y muestra "eliminado"', async () => {
    const service = new FakeService('base')
    const { result } = renderHook(() => useEntityCrud(service, 'Registro'))
    const wrapped = result.current(service)
    const item = { id: 9, name: 'Item a borrar' }

    const returned = await wrapped.delete!(9, item)

    expect(service.calls).toEqual([{ method: 'delete', args: [9, item] }])
    expect(showSuccess).toHaveBeenCalledWith('Registro eliminado')
    expect(returned).toBeUndefined()
  })

  it('delete funciona sin el item opcional', async () => {
    const service = new FakeService('base')
    const { result } = renderHook(() => useEntityCrud(service, 'Registro'))
    const wrapped = result.current(service)

    await wrapped.delete!(9)

    expect(service.calls).toEqual([{ method: 'delete', args: [9, undefined] }])
  })

  it('getAllPaginated reexpone el método del svc recibido por la factory conservando su `this`', async () => {
    const outerService = new FakeService('outer')
    const otherSvc = new FakeService('otro-svc')
    const { result } = renderHook(() => useEntityCrud(outerService, 'Producto'))

    // La factory se invoca con un servicio *distinto* al pasado a useEntityCrud
    // (como hace GenericPage al mezclar overrides con el servicio base).
    const wrapped = result.current(otherSvc)
    const page = await wrapped.getAllPaginated!(2, 25)

    // getAllPaginated corrió ligado a otherSvc, no al service externo del hook.
    expect(otherSvc.calls).toEqual([{ method: 'getAllPaginated', args: [2, 25] }])
    expect(outerService.calls).toEqual([])
    expect(page).toMatchObject({ page: 2, limit: 25, token: 'otro-svc' })
  })

  it('create/update/updatePartial/delete siempre delegan en el service externo, no en el svc de la factory', async () => {
    const outerService = new FakeService('outer')
    const otherSvc = new FakeService('otro-svc')
    const { result } = renderHook(() => useEntityCrud(outerService, 'Producto'))
    const wrapped = result.current(otherSvc)

    await wrapped.create!({ name: 'X' })

    expect(outerService.calls).toEqual([{ method: 'create', args: [{ name: 'X' }] }])
    expect(otherSvc.calls).toEqual([])
  })

  it('no muestra toast de éxito si el service rechaza (el error se propaga)', async () => {
    const service = new FakeService('base')
    service.create = vi.fn().mockRejectedValue(new Error('falló'))
    const { result } = renderHook(() => useEntityCrud(service, 'Producto'))
    const wrapped = result.current(service)

    await expect(wrapped.create!({ name: 'X' })).rejects.toThrow('falló')
    expect(showSuccess).not.toHaveBeenCalled()
  })
})
