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

/** Returns `{ startDate: 'YYYY-MM-01', endDate: 'YYYY-MM-DD' }` for the current month. */
export const getCurrentMonthRange = () => {
  const now = new Date()
  return {
    startDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
    endDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }
}

/** Formats today as `dd/mm/yyyy` in Spanish locale. */
export const getTodayFormatted = () =>
  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
