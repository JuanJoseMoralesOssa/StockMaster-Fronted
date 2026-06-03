import { EXPENSE, PURCHASE } from '../constants/cts'
import { monthNames, formatMonthName } from '../pages/dashboard/Detailed/chart.utils'

export interface FinancialTotals {
  Total: number
  Pagado: number
  Pendiente: number
}

export interface MonthlyFinancial extends FinancialTotals {
  name: string
  entityId: number
}

export interface EntityMonthlyData extends FinancialTotals {
  month: string
}

export interface DailyFinancial extends FinancialTotals {
  day: string
}

export interface DailyEntry {
  day: number
  date: string
  compra: number
  gasto: number
  pendiente: number
}

export interface MonthlyEntry {
  month: string
  total: number
  pagado: number
  pendiente: number
}

/** Shape required from each transaction record for these transforms. */
export interface TransactionRecord {
  date: string
  type: string
  weight_kg: number
}

export interface TransactionWithEntity extends TransactionRecord {
  entityId: number
  entityName?: string
}

/**
 * Aggregates transactions by (month, entityId) and computes Total/Pagado/Pendiente.
 * Works for both supplier-grouped (ProductChart) and product-grouped (SupplierCharts) views.
 */
export function aggregateByMonthAndEntity(
  results: TransactionWithEntity[],
  getEntityLabel: (entityId: number) => string,
): Record<string, MonthlyFinancial> {
  return results.reduce((acc: Record<string, MonthlyFinancial>, item) => {
    const date = new Date(item.date)
    const monthName = formatMonthName(date)
    const key = `${monthName}-${item.entityId}`
    const label = getEntityLabel(item.entityId)

    if (!acc[key]) {
      acc[key] = {
        name: `${monthName} (${label})`,
        Total: 0,
        Pagado: 0,
        Pendiente: 0,
        entityId: item.entityId,
      }
    }

    if (item.type === PURCHASE) acc[key].Total += item.weight_kg
    else if (item.type === EXPENSE) acc[key].Pagado += item.weight_kg

    acc[key].Pendiente = acc[key].Total - acc[key].Pagado
    return acc
  }, {})
}

/**
 * Groups monthly aggregates by entityId, strips the entity name from the month label,
 * and sorts entries by calendar month order.
 */
export function groupMonthlyByEntity(
  monthlyData: Record<string, MonthlyFinancial>,
): Record<number, EntityMonthlyData[]> {
  const byEntity: Record<number, EntityMonthlyData[]> = {}

  Object.values(monthlyData).forEach((item) => {
    if (!byEntity[item.entityId]) byEntity[item.entityId] = []
    byEntity[item.entityId].push({
      month: item.name.split(' (')[0],
      Total: item.Total,
      Pagado: item.Pagado,
      Pendiente: item.Pendiente,
    })
  })

  Object.keys(byEntity).forEach((id) => {
    byEntity[parseInt(id)].sort((a, b) => {
      const monthA = monthNames.indexOf(a.month.split(' ')[0])
      const monthB = monthNames.indexOf(b.month.split(' ')[0])
      return monthA - monthB
    })
  })

  return byEntity
}

/**
 * Groups transactions by entityId → month → day, accumulating Total/Pagado/Pendiente.
 * Days within each month are sorted ascending.
 */
export function groupDailyByEntityAndMonth(
  results: TransactionWithEntity[],
): Record<number, Record<string, DailyFinancial[]>> {
  const daily: Record<number, Record<string, DailyFinancial[]>> = {}

  results.forEach((item) => {
    const date = new Date(item.date ?? '')
    date.setTime(date.getTime() + new Date().getTimezoneOffset() * 60000)
    const monthName = formatMonthName(date)
    const dayString = `Día ${date.getDate()}`

    if (!daily[item.entityId]) daily[item.entityId] = {}
    if (!daily[item.entityId][monthName]) daily[item.entityId][monthName] = []

    let entry = daily[item.entityId][monthName].find((d) => d.day === dayString)
    if (!entry) {
      entry = { day: dayString, Total: 0, Pagado: 0, Pendiente: 0 }
      daily[item.entityId][monthName].push(entry)
    }

    if (item.type === PURCHASE) entry.Total += item.weight_kg
    else if (item.type === EXPENSE) entry.Pagado += item.weight_kg
    entry.Pendiente = entry.Total - entry.Pagado
  })

  Object.keys(daily).forEach((id) => {
    Object.keys(daily[parseInt(id)]).forEach((month) => {
      daily[parseInt(id)][month].sort((a, b) => {
        return parseInt(a.day.replace('Día ', '')) - parseInt(b.day.replace('Día ', ''))
      })
    })
  })

  return daily
}

/** Sums all Total/Pagado/Pendiente from a monthly aggregate map. */
export function sumTotals(monthlyData: Record<string, MonthlyFinancial>): FinancialTotals {
  return Object.values(monthlyData).reduce(
    (acc, d) => ({
      Total: acc.Total + d.Total,
      Pagado: acc.Pagado + d.Pagado,
      Pendiente: acc.Pendiente + d.Pendiente,
    }),
    { Total: 0, Pagado: 0, Pendiente: 0 },
  )
}

/** Returns a human-readable payment state string for a financial entry. */
export function paymentStateLabel(total: number, paid: number): string {
  if (total === 0) return 'Sin movimientos'
  return `${((paid / total) * 100).toFixed(2)}% Pagado`
}

/**
 * Processes transaction results into daily entries (for SupplierProductCharts).
 * Handles both ISO date strings and date objects.
 */
export function processDailyEntries(results: TransactionRecord[]): DailyEntry[] {
  const dailyMap = new Map<string, DailyEntry>()

  results.forEach((result) => {
    let dateKey = ''
    let day = 1
    if (result.date) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(result.date)) {
        dateKey = result.date
        day = parseInt(result.date.split('-')[2], 10)
      } else {
        const d = new Date(result.date)
        dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        day = d.getDate()
      }
    }

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { day, date: dateKey, compra: 0, gasto: 0, pendiente: 0 })
    }

    const entry = dailyMap.get(dateKey)!
    if (result.type === PURCHASE) entry.compra += result.weight_kg
    else entry.gasto += result.weight_kg
    entry.pendiente = entry.compra - entry.gasto
  })

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/** Processes transaction results into monthly entries (for SupplierProductCharts). */
export function processMonthlyEntries(results: TransactionRecord[]): MonthlyEntry[] {
  const monthlyMap = new Map<string, MonthlyEntry>()

  results.forEach((result) => {
    const date = new Date(result.date)
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { month: key, total: 0, pagado: 0, pendiente: 0 })
    }

    const entry = monthlyMap.get(key)!
    if (result.type === PURCHASE) entry.total += result.weight_kg
    else entry.pagado += result.weight_kg
    entry.pendiente = entry.total - entry.pagado
  })

  return Array.from(monthlyMap.values())
}

/** Groups daily entries by month key (for SupplierProductCharts monthly breakdown). */
export function groupDailyEntriesByMonth(dailyData: DailyEntry[]): Record<string, DailyEntry[]> {
  const grouped: Record<string, DailyEntry[]> = {}

  dailyData.forEach((day) => {
    const date = new Date(day.date)
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(day)
  })

  return grouped
}
