/**
 * Convierte a `Number` los campos indicados cuando vienen definidos.
 * Útil en `prepareDataForSubmit`: los inputs `type="number"` entregan strings.
 */
export function coerceNumericFields<T extends object>(data: T, keys: Array<keyof T>): T {
  const result = { ...data }

  for (const key of keys) {
    const value = result[key]
    if (value !== undefined && value !== null) {
      result[key] = Number(value) as T[typeof key]
    }
  }

  return result
}
