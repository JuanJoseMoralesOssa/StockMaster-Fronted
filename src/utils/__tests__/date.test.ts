import { describe, expect, it } from 'vitest'
import {
  formatLocalDate,
  getCurrentMonthRange,
  todayBogota,
  toDateInputValue,
} from '../date'

describe('date utilities', () => {
  it('keeps ISO calendar dates stable for date inputs', () => {
    expect(toDateInputValue('2026-01-20T00:00:00.000Z')).toBe('2026-01-20')
    expect(toDateInputValue('2026-01-20')).toBe('2026-01-20')
  })

  it('formats ISO calendar dates without shifting to the previous Bogota day', () => {
    expect(formatLocalDate('2026-01-20T00:00:00.000Z')).toBe('20/01/2026')
  })

  it('uses America/Bogota for current day calculations', () => {
    const utcLateNight = new Date('2026-07-01T02:00:00.000Z')

    expect(todayBogota(utcLateNight)).toBe('2026-06-30')
    expect(getCurrentMonthRange(utcLateNight)).toEqual({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    })
  })
})
