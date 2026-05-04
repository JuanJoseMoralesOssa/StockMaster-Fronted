import { create, UseBoundStore, StoreApi } from 'zustand'
import { EntityStore } from '../types/StoreTypes'

const CACHE_TIME = 5 * 60 * 1000 // 5 minutos

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function createEntityStore<T, K extends string>(key: K, service: { getAll: () => Promise<T[]> }): UseBoundStore<StoreApi<EntityStore<T, K>>> {
  const fetchName = `fetch${capitalize(key)}` as `fetch${Capitalize<K>}`
  const refreshName = `refresh${capitalize(key)}` as `refresh${Capitalize<K>}`

  return create<EntityStore<T, K>>((set, get) => {
    const store = {
      [key]: [] as T[],
      isLoading: false,
      error: null as Error | null,
      lastFetch: null as number | null,

      async [fetchName]() {
        const state = get()
        if (state.isLoading) return
        if (state.lastFetch && Date.now() - state.lastFetch < CACHE_TIME) return

        set(prev => ({ ...prev, isLoading: true, error: null }))
        try {
          const items = await service.getAll()
          set(prev => ({ ...prev, [key]: items, isLoading: false, error: null, lastFetch: Date.now() }))
        } catch (err) {
          console.error(`Error fetching ${key}:`, err)
          set(prev => ({ ...prev, error: err instanceof Error ? err : new Error(`Error desconocido al obtener ${key}`), isLoading: false }))
        }
      },

      async [refreshName]() {
        set(prev => ({ ...prev, lastFetch: null }))
        const state = get() as EntityStore<T, K>
        const fetchEntity = state[fetchName] as () => Promise<void>
        await fetchEntity()
      },

      clearCache() {
        set(prev => ({ ...prev, [key]: [], error: null, lastFetch: null }))
      },
    } as unknown as EntityStore<T, K>
    return store
  })
}

export default createEntityStore
