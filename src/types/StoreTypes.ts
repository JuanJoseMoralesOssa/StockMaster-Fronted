// Shared types for entity stores
export type EntityStore<T, K extends string> = {
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

export default EntityStore
