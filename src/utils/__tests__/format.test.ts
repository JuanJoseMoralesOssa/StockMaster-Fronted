import { describe, it, expect } from 'vitest'
import { toNumber, formatKg, formatInt, formatPercent } from '../format'

describe('toNumber', () => {
  it('coacciona los strings numéricos del backend (numeric de Postgres)', () => {
    expect(toNumber('12.000')).toBe(12)
    expect(toNumber('1.5')).toBe(1.5)
    expect(toNumber(12.5)).toBe(12.5)
  })

  it('devuelve 0 para null/undefined/vacío', () => {
    expect(toNumber(null)).toBe(0)
    expect(toNumber(undefined)).toBe(0)
    expect(toNumber('')).toBe(0)
  })

  it('devuelve 0 para valores no numéricos o no finitos', () => {
    expect(toNumber('abc')).toBe(0)
    expect(toNumber(NaN)).toBe(0)
    expect(toNumber(Infinity)).toBe(0)
  })
})

describe('formatKg', () => {
  it('usa punto decimal y omite ceros sobrantes', () => {
    expect(formatKg('12.000')).toBe('12')
    expect(formatKg(12.5)).toBe('12.5')
    expect(formatKg(1234.05)).toBe('1234.05')
  })

  it('no agrupa miles', () => {
    expect(formatKg(1000)).toBe('1000')
    expect(formatKg(1234567.5)).toBe('1234567.5')
  })

  it('limita a 3 decimales', () => {
    expect(formatKg(1.23456)).toBe('1.235')
  })

  it('coacciona null / string inválido a "0"', () => {
    expect(formatKg(null)).toBe('0')
    expect(formatKg('abc')).toBe('0')
  })
})

describe('formatInt', () => {
  it('sin separador de miles ni decimales', () => {
    expect(formatInt(1234)).toBe('1234')
    expect(formatInt(1234.7)).toBe('1235')
  })
})

describe('formatPercent', () => {
  it('formatea con punto decimal y los dígitos pedidos', () => {
    expect(formatPercent(50)).toBe('50%')
    expect(formatPercent(33.333, 1)).toBe('33.3%')
    expect(formatPercent(0, 0)).toBe('0%')
  })
})
