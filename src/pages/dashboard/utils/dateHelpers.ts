const pad = (n: number) => n.toString().padStart(2, '0')

const parseDateInput = (value: string): { year: number; month: number; day: number } => {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

const fromUtcDateInput = (value: string): Date => {
  const { year, month, day } = parseDateInput(value)
  return new Date(Date.UTC(year, month - 1, day))
}

const toDateInput = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

/** Returns the full previous calendar-month range given any startDate string (YYYY-MM-DD). */
export const getPrevMonthRange = (startDate: string) => {
  const { year, month } = parseDateInput(startDate)
  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const lastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate()
  return {
    startDate: `${prevYear}-${pad(prevMonth)}-01`,
    endDate: `${prevYear}-${pad(prevMonth)}-${pad(lastDay)}`
  }
}

/**
 * Returns the immediately-preceding period of the SAME length as [start, end].
 * E.g. for a 10-day range it returns the 10 days right before it; for a 3-month
 * range, the prior 3 months. Used so the KPI delta compares like-with-like.
 */
export const getPreviousPeriodRange = (startDate: string, endDate: string) => {
  const start = fromUtcDateInput(startDate)
  const end = fromUtcDateInput(endDate)
  const dayMs = 24 * 60 * 60 * 1000
  // Inclusive length in days
  const lengthDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1
  const prevEnd = new Date(start.getTime() - dayMs)
  const prevStart = new Date(prevEnd.getTime() - (lengthDays - 1) * dayMs)
  return { startDate: toDateInput(prevStart), endDate: toDateInput(prevEnd) }
}

// Rango del mes en curso: implementación compartida en utils/date.
export { getCurrentMonthRange } from '@/utils/date'

/** Formats today as `dd/mm/yyyy` in Spanish locale. */
export const getTodayFormatted = () =>
  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
