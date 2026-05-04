export interface DateRangeFilters {
  startDate: string
  endDate: string
  personId: string
  productId: string
  activeDate: boolean
}

export function formatLocalDate(date?: string): string {
  if (!date) return 'Fecha no disponible'

  const offset = new Date().getTimezoneOffset() * 60000
  const parsedDate = new Date(date)
  parsedDate.setTime(parsedDate.getTime() + offset)

  if (Number.isNaN(parsedDate.getTime())) return 'Fecha inválida'

  return parsedDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function toDateInputValue(value?: string): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''

  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
}

export function buildInitialDateRangeFilters(): DateRangeFilters {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${day}`,
    personId: '',
    productId: '',
    activeDate: false,
  }
}
