import { create, UseBoundStore, StoreApi } from 'zustand'

const CACHE_TIME = 5 * 60 * 1000 // 5 minutos

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type EntityStore<T, K extends string> = {
  [P in K]: T[]
} & {
  isLoading: boolean
  error: Error | null
  lastFetch: number | null
} & {
  [P in `fetch${Capitalize<K>}`]: () => Promise<void>
} & {
  [P in `refresh${Capitalize<K>}`]: () => Promise<void>
} & {
  clearCache: () => void
}

export function createEntityStore<T, K extends string>(key: K, service: { getAll: () => Promise<T[]> }): UseBoundStore<StoreApi<EntityStore<T, K>>> {
  const fetchName = `fetch${capitalize(key)}`
  const refreshName = `refresh${capitalize(key)}`

  return create<EntityStore<T, K>>((set, get) => {
    const store: EntityStore<T, K> = {
      [key]: [] as T[],
      isLoading: false,
      error: null,
      lastFetch: null,

      async [fetchName]() {
        const { lastFetch, isLoading } = get() as unknown as EntityStore<T, K>
        if (isLoading) return
        if (lastFetch && Date.now() - lastFetch < CACHE_TIME) return

        set({ isLoading: true, error: null } as unknown as Partial<EntityStore<T, K>>)
        try {
          const items = await service.getAll()
          const update = {
            isLoading: false,
            error: null,
            lastFetch: Date.now(),
          } as unknown as Partial<EntityStore<T, K>>
            ; (update as Record<string, unknown>)[key] = items
          set(update)
        } catch (error) {
          console.error(`Error fetching ${key}:`, error)
          set({ error: error instanceof Error ? error : new Error(`Error desconocido al obtener ${key}`), isLoading: false } as Partial<EntityStore<T, K>>)
        }
      },

      async [refreshName]() {
        set({ lastFetch: null } as unknown as Partial<EntityStore<T, K>>)
        const g = get() as unknown as Record<string, unknown>
        const fn = g[fetchName] as (() => Promise<void>) | undefined
        if (fn) await fn()
      },

      clearCache() {
        const update = { error: null, lastFetch: null } as unknown as Partial<EntityStore<T, K>>
          ; (update as Record<string, unknown>)[key] = []
        set(update)
      },
    } as EntityStore<T, K>
    return store
  })
}

export default createEntityStore
