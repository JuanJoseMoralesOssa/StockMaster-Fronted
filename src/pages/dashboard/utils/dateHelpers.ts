const pad = (n: number) => n.toString().padStart(2, '0')

/** Returns the full previous calendar-month range given any startDate string (YYYY-MM-DD). */
export const getPrevMonthRange = (startDate: string) => {
  const d = new Date(startDate + 'T00:00:00')
  const prevYear = d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()
  const prevMonth = d.getMonth() === 0 ? 12 : d.getMonth() // 1-based
  const lastDay = new Date(prevYear, prevMonth, 0).getDate()
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
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const dayMs = 24 * 60 * 60 * 1000
  // Inclusive length in days
  const lengthDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1
  const prevEnd = new Date(start.getTime() - dayMs)
  const prevStart = new Date(prevEnd.getTime() - (lengthDays - 1) * dayMs)
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { startDate: fmt(prevStart), endDate: fmt(prevEnd) }
}

// Rango del mes en curso: implementación compartida en utils/date.
export { getCurrentMonthRange } from '@/utils/date'

/** Formats today as `dd/mm/yyyy` in Spanish locale. */
export const getTodayFormatted = () =>
  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
