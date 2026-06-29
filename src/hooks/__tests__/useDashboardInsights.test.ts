import { describe, it, expect } from 'vitest'
import { dayDiff, clampTrendStart, pickInterval } from '../useDashboardInsights'

describe('dayDiff', () => {
  it('cuenta los días de calendario entre dos fechas ISO', () => {
    expect(dayDiff('2024-01-01', '2024-01-01')).toBe(0)
    expect(dayDiff('2024-01-01', '2024-01-31')).toBe(30)
  })
})

describe('clampTrendStart', () => {
  it('no toca rangos de 365 días o menos (límite del backend)', () => {
    // 2024 es bisiesto: 1 ene → 31 dic = 365 días exactos.
    expect(clampTrendStart('2024-01-01', '2024-12-31')).toBe('2024-01-01')
  })

  it('acota un rango > 365 días a exactamente 365 antes del fin', () => {
    const clamped = clampTrendStart('2020-01-01', '2024-12-31')
    expect(dayDiff(clamped, '2024-12-31')).toBe(365)
  })
})

describe('pickInterval', () => {
  it('day hasta 31 días, week en 32–92, month por encima de 92', () => {
    expect(pickInterval('2024-01-01', '2024-02-01')).toBe('day') // 31
    expect(pickInterval('2024-01-01', '2024-02-02')).toBe('week') // 32
    expect(pickInterval('2024-01-01', '2024-04-02')).toBe('week') // 92
    expect(pickInterval('2024-01-01', '2024-04-03')).toBe('month') // 93
  })
})
