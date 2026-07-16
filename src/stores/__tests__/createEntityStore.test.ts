/**
 * Pruebas de createEntityStore: fija la invariante de caché en memoria con
 * TTL de 5 minutos (sin persistencia), la deduplicación de fetches
 * concurrentes y el comportamiento de refresh/clearCache/errores.
 *
 * El service se inyecta como parámetro (`{ getAll: () => Promise<T[]> }`),
 * así que usamos un fake en vez de mockear módulos.
 */
import type { StoreApi, UseBoundStore } from 'zustand'
import { createEntityStore } from '../createEntityStore'
import type { EntityStore } from '../../types/StoreTypes'

interface Item {
  id: number
  name: string
}

const ITEM_A: Item = { id: 1, name: 'a' }
const ITEM_B: Item = { id: 2, name: 'b' }

const FIVE_MIN_MS = 5 * 60 * 1000
// Epoch realista para el reloj simulado; la guarda de TTL compara contra
// `lastFetch !== null`, así que cualquier timestamp (incluso 0) es válido.
const BASE_TIME = 1_700_000_000_000

type ItemsStore = UseBoundStore<StoreApi<EntityStore<Item, 'items'>>>

function makeStore(service: { getAll: () => Promise<Item[]> }): ItemsStore {
  return createEntityStore<Item, 'items'>('items', service)
}

describe('createEntityStore', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('la primera llamada a fetchItems invoca service.getAll, puebla items y setea lastFetch', async () => {
    const getAll = vi.fn().mockResolvedValue([ITEM_A])
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()

    expect(getAll).toHaveBeenCalledTimes(1)
    expect(useStore.getState().items).toEqual([ITEM_A])
    expect(useStore.getState().lastFetch).not.toBeNull()
    expect(useStore.getState().isLoading).toBe(false)
    expect(useStore.getState().error).toBeNull()
  })

  it('una segunda llamada dentro del TTL de 5 minutos no refetchea', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    const getAll = vi.fn().mockResolvedValue([ITEM_A])
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()
    vi.setSystemTime(BASE_TIME + FIVE_MIN_MS - 1)
    await useStore.getState().fetchItems()

    expect(getAll).toHaveBeenCalledTimes(1)
    expect(useStore.getState().items).toEqual([ITEM_A])
  })

  it('pasado el TTL, refetchea', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    const getAll = vi
      .fn()
      .mockResolvedValueOnce([ITEM_A])
      .mockResolvedValueOnce([ITEM_A, ITEM_B])
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()
    vi.setSystemTime(BASE_TIME + FIVE_MIN_MS + 1)
    await useStore.getState().fetchItems()

    expect(getAll).toHaveBeenCalledTimes(2)
    expect(useStore.getState().items).toEqual([ITEM_A, ITEM_B])
  })

  it('si isLoading está activo, una llamada concurrente no dispara un segundo fetch', async () => {
    let resolveGetAll: (items: Item[]) => void = () => {}
    const getAll = vi.fn().mockImplementation(
      () =>
        new Promise<Item[]>((resolve) => {
          resolveGetAll = resolve
        }),
    )
    const useStore = makeStore({ getAll })

    const first = useStore.getState().fetchItems()
    const second = useStore.getState().fetchItems()

    // Ambas llamadas ya corrieron su tramo síncrono (hasta el primer await):
    // isLoading quedó en true antes de que resolvamos la promesa.
    expect(useStore.getState().isLoading).toBe(true)

    resolveGetAll([ITEM_A])
    await Promise.all([first, second])

    expect(getAll).toHaveBeenCalledTimes(1)
    expect(useStore.getState().items).toEqual([ITEM_A])
    expect(useStore.getState().isLoading).toBe(false)
  })

  it('refreshItems resetea lastFetch y refetchea inmediatamente aunque el TTL no haya vencido', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    const getAll = vi
      .fn()
      .mockResolvedValueOnce([ITEM_A])
      .mockResolvedValueOnce([ITEM_A, ITEM_B])
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()
    vi.setSystemTime(BASE_TIME + 1000) // muy dentro del TTL de 5 minutos
    await useStore.getState().refreshItems()

    expect(getAll).toHaveBeenCalledTimes(2)
    expect(useStore.getState().items).toEqual([ITEM_A, ITEM_B])
    expect(useStore.getState().lastFetch).toBe(BASE_TIME + 1000)
  })

  it('clearCache vacía items, error y lastFetch', async () => {
    const getAll = vi.fn().mockResolvedValue([ITEM_A])
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()
    useStore.getState().clearCache()

    expect(useStore.getState().items).toEqual([])
    expect(useStore.getState().error).toBeNull()
    expect(useStore.getState().lastFetch).toBeNull()
  })

  it('si getAll rechaza, error queda en estado (instancia de Error), isLoading es false y los items previos se mantienen', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
    const getAll = vi
      .fn()
      .mockResolvedValueOnce([ITEM_A])
      .mockRejectedValueOnce(new Error('boom'))
    const useStore = makeStore({ getAll })

    await useStore.getState().fetchItems()
    // Forzamos el segundo fetch pese a estar dentro del TTL, para poder
    // ejercitar la rama de error sin esperar 5 minutos.
    await useStore.getState().refreshItems()

    expect(useStore.getState().error).toBeInstanceOf(Error)
    expect((useStore.getState().error as Error).message).toBe('boom')
    expect(useStore.getState().isLoading).toBe(false)
    // Nota de comportamiento real: el catch de fetchX no limpia `items`, así
    // que el último estado exitoso queda visible en pantalla en vez de
    // vaciarse ante un error de refetch.
    expect(useStore.getState().items).toEqual([ITEM_A])
  })
})
