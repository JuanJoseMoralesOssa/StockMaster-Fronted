import { describe, it, expect } from 'vitest'
import {
  aggregateByMonthAndEntity,
  groupMonthlyByEntity,
  groupDailyByEntityAndMonth,
  sumTotals,
  paymentStateLabel,
  matchesPaymentStatus,
  processDailyEntries,
  processMonthlyEntries,
  groupDailyEntriesByMonth,
} from '../chartTransforms'

const PURCHASE = 'Compra'
const EXPENSE = 'Gasto'

// Helpers
const purchase = (date: string, entityId: number, kg: number) => ({
  date,
  type: PURCHASE,
  weight_kg: kg,
  entityId,
})
const expense = (date: string, entityId: number, kg: number) => ({
  date,
  type: EXPENSE,
  weight_kg: kg,
  entityId,
})

describe('aggregateByMonthAndEntity', () => {
  it('aggregates purchases and expenses by month + entity', () => {
    const results = [
      purchase('2024-01-15', 1, 100),
      expense('2024-01-20', 1, 60),
      purchase('2024-02-10', 1, 50),
    ]
    const getLabel = (id: number) => `Entity ${id}`
    const out = aggregateByMonthAndEntity(results, getLabel)

    const jan = Object.values(out).find((d) => d.name.startsWith('Ene'))
    const feb = Object.values(out).find((d) => d.name.startsWith('Feb'))

    expect(jan?.Total).toBe(100)
    expect(jan?.Pagado).toBe(60)
    expect(jan?.Pendiente).toBe(40)
    expect(feb?.Total).toBe(50)
    expect(feb?.Pagado).toBe(0)
    expect(feb?.Pendiente).toBe(50)
  })

  it('keeps separate buckets for different entities in the same month', () => {
    const results = [
      purchase('2024-03-01', 1, 200),
      purchase('2024-03-15', 2, 300),
    ]
    const out = aggregateByMonthAndEntity(results, (id) => `E${id}`)
    expect(Object.keys(out)).toHaveLength(2)
  })

  it('returns empty object for empty input', () => {
    expect(aggregateByMonthAndEntity([], () => 'x')).toEqual({})
  })
})

describe('sumTotals', () => {
  it('sums all entries correctly', () => {
    const data = {
      a: { name: 'A', entityId: 1, Total: 100, Pagado: 60, Pendiente: 40 },
      b: { name: 'B', entityId: 2, Total: 50, Pagado: 50, Pendiente: 0 },
    }
    const totals = sumTotals(data)
    expect(totals.Total).toBe(150)
    expect(totals.Pagado).toBe(110)
    expect(totals.Pendiente).toBe(40)
  })

  it('returns zeros for empty map', () => {
    expect(sumTotals({})).toEqual({ Total: 0, Pagado: 0, Pendiente: 0 })
  })
})

describe('paymentStateLabel', () => {
  it('returns Sin movimientos when total is 0', () => {
    expect(paymentStateLabel(0, 0)).toBe('Sin movimientos')
  })

  it('returns percentage label when total > 0', () => {
    const label = paymentStateLabel(200, 100)
    expect(label).toBe('50.00% Pagado')
  })
})

describe('matchesPaymentStatus', () => {
  it('keeps all rows for the all filter', () => {
    expect(matchesPaymentStatus({ Total: 0, Pendiente: 0 }, 'all')).toBe(true)
    expect(matchesPaymentStatus({ Total: 100, Pendiente: 40 }, 'all')).toBe(true)
  })

  it('matches rows with pending debt', () => {
    expect(matchesPaymentStatus({ Total: 100, Pendiente: 40 }, 'withDebt')).toBe(true)
    expect(matchesPaymentStatus({ Total: 100, Pendiente: 0 }, 'withDebt')).toBe(false)
  })

  it('matches fully paid rows only when there were purchases', () => {
    expect(matchesPaymentStatus({ Total: 100, Pendiente: 0 }, 'fullyPaid')).toBe(true)
    expect(matchesPaymentStatus({ Total: 100, Pendiente: -10 }, 'fullyPaid')).toBe(true)
    expect(matchesPaymentStatus({ Total: 0, Pendiente: 0 }, 'fullyPaid')).toBe(false)
  })
})

describe('groupMonthlyByEntity', () => {
  it('separates entries by entityId and strips the entity label from month', () => {
    const data = {
      'Ene 2024-1': { name: 'Ene 2024 (Alice)', entityId: 1, Total: 10, Pagado: 5, Pendiente: 5 },
      'Feb 2024-1': { name: 'Feb 2024 (Alice)', entityId: 1, Total: 20, Pagado: 10, Pendiente: 10 },
      'Ene 2024-2': { name: 'Ene 2024 (Bob)', entityId: 2, Total: 30, Pagado: 15, Pendiente: 15 },
    }
    const out = groupMonthlyByEntity(data)
    expect(out[1]).toHaveLength(2)
    expect(out[2]).toHaveLength(1)
    expect(out[1][0].month).not.toContain('(Alice)')
  })
})

describe('groupDailyByEntityAndMonth', () => {
  it('groups by entity, then month, then day', () => {
    const results = [
      { date: '2024-01-10', type: PURCHASE, weight_kg: 50, entityId: 1 },
      { date: '2024-01-10', type: EXPENSE, weight_kg: 20, entityId: 1 },
      { date: '2024-01-15', type: PURCHASE, weight_kg: 30, entityId: 1 },
    ]
    const out = groupDailyByEntityAndMonth(results)
    const janDays = out[1]['Ene 2024']

    expect(janDays).toBeDefined()
    expect(janDays).toHaveLength(2)

    const day10 = janDays.find((d) => d.day === 'Día 10')
    expect(day10?.Total).toBe(50)
    expect(day10?.Pagado).toBe(20)
    expect(day10?.Pendiente).toBe(30)
  })

  it('sorts days ascending within each month', () => {
    const results = [
      { date: '2024-01-20', type: PURCHASE, weight_kg: 10, entityId: 1 },
      { date: '2024-01-05', type: PURCHASE, weight_kg: 10, entityId: 1 },
    ]
    const out = groupDailyByEntityAndMonth(results)
    const days = out[1]['Ene 2024']
    expect(parseInt(days[0].day.replace('Día ', ''))).toBeLessThan(
      parseInt(days[1].day.replace('Día ', '')),
    )
  })
})

describe('processDailyEntries', () => {
  it('processes ISO date strings correctly', () => {
    const results = [
      { date: '2024-03-05', type: PURCHASE, weight_kg: 80 },
      { date: '2024-03-05', type: EXPENSE, weight_kg: 30 },
    ]
    const out = processDailyEntries(results)
    expect(out).toHaveLength(1)
    expect(out[0].compra).toBe(80)
    expect(out[0].gasto).toBe(30)
    expect(out[0].pendiente).toBe(50)
    expect(out[0].day).toBe(5)
  })

  it('sorts output by date ascending', () => {
    const results = [
      { date: '2024-03-10', type: PURCHASE, weight_kg: 10 },
      { date: '2024-03-01', type: PURCHASE, weight_kg: 10 },
    ]
    const out = processDailyEntries(results)
    expect(out[0].date).toBe('2024-03-01')
    expect(out[1].date).toBe('2024-03-10')
  })

  it('returns empty array for empty input', () => {
    expect(processDailyEntries([])).toEqual([])
  })
})

describe('processMonthlyEntries', () => {
  it('aggregates by month correctly', () => {
    const results = [
      { date: '2024-01-05', type: PURCHASE, weight_kg: 100 },
      { date: '2024-01-20', type: EXPENSE, weight_kg: 40 },
      { date: '2024-02-10', type: PURCHASE, weight_kg: 60 },
    ]
    const out = processMonthlyEntries(results)
    expect(out).toHaveLength(2)
    const jan = out.find((m) => m.month.startsWith('Ene'))
    expect(jan?.total).toBe(100)
    expect(jan?.pagado).toBe(40)
    expect(jan?.pendiente).toBe(60)
  })
})

describe('groupDailyEntriesByMonth', () => {
  it('groups days under the correct month key', () => {
    const daily = [
      { day: 5, date: '2024-01-05', compra: 10, gasto: 5, pendiente: 5 },
      { day: 10, date: '2024-01-10', compra: 20, gasto: 10, pendiente: 10 },
      { day: 3, date: '2024-02-03', compra: 30, gasto: 15, pendiente: 15 },
    ]
    const out = groupDailyEntriesByMonth(daily)
    expect(Object.keys(out)).toHaveLength(2)
    expect(out['Ene 2024']).toHaveLength(2)
    expect(out['Feb 2024']).toHaveLength(1)
  })
})
