import { describe, expect, it } from 'vitest'
import { getPrevMonthRange, getPreviousPeriodRange } from '../dateHelpers'

// El delta de los KPIs compara el período elegido contra el inmediatamente
// anterior del MISMO largo. La aritmética es inclusive en ambos extremos, así que
// un off-by-one acá desplaza silenciosamente todos los porcentajes del dashboard.
describe('getPreviousPeriodRange', () => {
  it('returns the 10 days immediately before a 10-day range', () => {
    expect(getPreviousPeriodRange('2026-07-01', '2026-07-10')).toEqual({
      startDate: '2026-06-21',
      endDate: '2026-06-30',
    })
  })

  it('returns the previous day for a single-day range', () => {
    expect(getPreviousPeriodRange('2026-07-11', '2026-07-11')).toEqual({
      startDate: '2026-07-10',
      endDate: '2026-07-10',
    })
  })

  it('preserves the length rather than snapping to the previous calendar month', () => {
    // Julio tiene 31 días, así que el período previo son los 31 días anteriores
    // (31 de mayo incluido), NO el mes de junio (30 días).
    expect(getPreviousPeriodRange('2026-07-01', '2026-07-31')).toEqual({
      startDate: '2026-05-31',
      endDate: '2026-06-30',
    })
  })

  it('crosses the year boundary', () => {
    expect(getPreviousPeriodRange('2026-01-01', '2026-01-31')).toEqual({
      startDate: '2025-12-01',
      endDate: '2025-12-31',
    })
  })

  it('spans the same number of days as the original range', () => {
    // Original: 5..20 de marzo = 16 días. Previo: 17 feb..4 mar = 12 días de
    // febrero + 4 de marzo = 16 días. Cruza el borde de mes hacia atrás.
    expect(getPreviousPeriodRange('2026-03-05', '2026-03-20')).toEqual({
      startDate: '2026-02-17',
      endDate: '2026-03-04',
    })
  })
})

describe('getPrevMonthRange', () => {
  it('returns the full previous calendar month', () => {
    expect(getPrevMonthRange('2026-07-15')).toEqual({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    })
  })

  it('rolls back to December of the previous year from January', () => {
    expect(getPrevMonthRange('2026-01-10')).toEqual({
      startDate: '2025-12-01',
      endDate: '2025-12-31',
    })
  })

  it('gives February 28 days in a common year', () => {
    expect(getPrevMonthRange('2026-03-05')).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    })
  })

  it('gives February 29 days in a leap year', () => {
    expect(getPrevMonthRange('2024-03-05')).toEqual({
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    })
  })
})
