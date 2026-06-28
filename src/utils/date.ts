export interface DateRangeFilters {
  startDate: string
  endDate: string
  personId: string
  personName?: string
  productId: string
  productName?: string
  activeDate: boolean
}

export const BOGOTA_TIME_ZONE = 'America/Bogota'

const DATE_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})/
const pad = (n: number) => n.toString().padStart(2, '0')

type DateParts = {
  year: string
  month: string
  day: string
}

function getBogotaDateParts(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOGOTA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: parts.find((p) => p.type === 'year')?.value ?? '',
    month: parts.find((p) => p.type === 'month')?.value ?? '',
    day: parts.find((p) => p.type === 'day')?.value ?? '',
  }
}

export function getCalendarDateParts(value?: string): DateParts | undefined {
  if (!value) return undefined

  const datePrefix = value.match(DATE_PREFIX_RE)
  if (datePrefix) {
    return {
      year: datePrefix[1],
      month: datePrefix[2],
      day: datePrefix[3],
    }
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return undefined

  return getBogotaDateParts(parsedDate)
}

export function toCalendarDate(value?: string): string {
  const parts = getCalendarDateParts(value)
  if (!parts) return ''
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function formatLocalDate(date?: string): string {
  const parts = getCalendarDateParts(date)
  if (!date) return 'Fecha no disponible'
  if (!parts) return 'Fecha inválida'

  return `${parts.day}/${parts.month}/${parts.year}`
}

export function toDateInputValue(value?: string): string {
  return toCalendarDate(value)
}

export function todayBogota(date = new Date()): string {
  const { year, month, day } = getBogotaDateParts(date)
  return `${year}-${month}-${day}`
}

/** Devuelve `{ startDate: 'YYYY-MM-01', endDate: 'YYYY-MM-DD' }` para el mes en curso. */
export function getCurrentMonthRange(date = new Date()): { startDate: string; endDate: string } {
  const today = todayBogota(date)
  const [year, month, day] = today.split('-')
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${pad(Number(day))}`,
  }
}

export function buildInitialDateRangeFilters(): DateRangeFilters {
  const { startDate, endDate } = getCurrentMonthRange()

  return {
    startDate,
    endDate,
    personId: '',
    personName: '',
    productId: '',
    productName: '',
    activeDate: false,
  }
}
