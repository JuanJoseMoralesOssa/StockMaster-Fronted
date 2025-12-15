import { GenericColumn } from "../../../../types/GenericConfig"

// Helpers reutilizables para GenericTable
export function getCellValue<T>(item: T, column: GenericColumn<T>) {
  if (column.render) {
    return column.render(item)
  }

  const value = item[column.key as keyof typeof item]
  if (value === null || value === undefined) return '-'

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}
