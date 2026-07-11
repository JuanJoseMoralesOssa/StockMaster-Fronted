import { PAYMENT, PURCHASE } from '../constants/cts'
import { monthNames } from '../pages/dashboard/Detailed/chart.utils'
import { getCalendarDateParts, toCalendarDate } from './date'
import { toNumber } from './format'

export interface FinancialTotals {
  Total: number
  Pagado: number
  Pendiente: number
}

export type PaymentStatusFilter = 'all' | 'withDebt' | 'fullyPaid'

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
  pago: number
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

function monthNameFromDate(value: string): string {
  const parts = getCalendarDateParts(value)
  if (!parts) return ''
  return `${monthNames[Number(parts.month) - 1]} ${parts.year}`
}

function dayFromDate(value: string): number {
  const parts = getCalendarDateParts(value)
  return parts ? Number(parts.day) : 1
}

/**
 * Aggregates transactions by (month, entityId) and computes Total/Pagado/Pendiente.
 * La entidad es el eje del desglose, sea proveedor o producto: ambas vistas del
 * dashboard detallado comparten esta función (ver EntityBreakdownCharts).
 */
export function aggregateByMonthAndEntity(
  results: TransactionWithEntity[],
  getEntityLabel: (entityId: number) => string,
): Record<string, MonthlyFinancial> {
  return results.reduce((acc: Record<string, MonthlyFinancial>, item) => {
    const monthName = monthNameFromDate(item.date)
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

    const weight = toNumber(item.weight_kg)
    if (item.type === PURCHASE) acc[key].Total += weight
    else if (item.type === PAYMENT) acc[key].Pagado += weight

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
    const monthName = monthNameFromDate(item.date)
    const dayString = `Día ${dayFromDate(item.date)}`

    if (!daily[item.entityId]) daily[item.entityId] = {}
    if (!daily[item.entityId][monthName]) daily[item.entityId][monthName] = []

    let entry = daily[item.entityId][monthName].find((d) => d.day === dayString)
    if (!entry) {
      entry = { day: dayString, Total: 0, Pagado: 0, Pendiente: 0 }
      daily[item.entityId][monthName].push(entry)
    }

    const weight = toNumber(item.weight_kg)
    if (item.type === PURCHASE) entry.Total += weight
    else if (item.type === PAYMENT) entry.Pagado += weight
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

/** Matches the dashboard payment-status filter against an aggregated row. */
export function matchesPaymentStatus(
  totals: Pick<FinancialTotals, 'Total' | 'Pendiente'>,
  filter: PaymentStatusFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'withDebt') return totals.Pendiente > 0
  return totals.Total > 0 && totals.Pendiente <= 0
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
      dateKey = toCalendarDate(result.date)
      day = dayFromDate(result.date)
    }

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { day, date: dateKey, compra: 0, pago: 0, pendiente: 0 })
    }

    const entry = dailyMap.get(dateKey)!
    const weight = toNumber(result.weight_kg)
    if (result.type === PURCHASE) entry.compra += weight
    else entry.pago += weight
    entry.pendiente = entry.compra - entry.pago
  })

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/** Processes transaction results into monthly entries (for SupplierProductCharts). */
export function processMonthlyEntries(results: TransactionRecord[]): MonthlyEntry[] {
  const monthlyMap = new Map<string, MonthlyEntry>()

  results.forEach((result) => {
    const key = monthNameFromDate(result.date)

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { month: key, total: 0, pagado: 0, pendiente: 0 })
    }

    const entry = monthlyMap.get(key)!
    const weight = toNumber(result.weight_kg)
    if (result.type === PURCHASE) entry.total += weight
    else entry.pagado += weight
    entry.pendiente = entry.total - entry.pagado
  })

  return Array.from(monthlyMap.values())
}

/** Groups daily entries by month key (for SupplierProductCharts monthly breakdown). */
export function groupDailyEntriesByMonth(dailyData: DailyEntry[]): Record<string, DailyEntry[]> {
  const grouped: Record<string, DailyEntry[]> = {}

  dailyData.forEach((day) => {
    const key = monthNameFromDate(day.date)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(day)
  })

  return grouped
}
