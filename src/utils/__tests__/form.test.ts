/**
 * Pruebas de coerceNumericFields: coerción de strings de inputs numéricos.
 */
import { coerceNumericFields } from '../form'

describe('coerceNumericFields', () => {
  it('convierte a Number los campos indicados', () => {
    const data = { input: '5', output: '0', balance: '12.5', name: 'x' }
    const result = coerceNumericFields(data, ['input', 'output', 'balance'])

    expect(result.input).toBe(5)
    expect(result.output).toBe(0)
    expect(result.balance).toBe(12.5)
    expect(result.name).toBe('x')
  })

  it('deja intactos los campos undefined o null', () => {
    const data: { input?: string | null; output?: string } = { input: null }
    const result = coerceNumericFields(data, ['input', 'output'])

    expect(result.input).toBeNull()
    expect(result.output).toBeUndefined()
  })

  it('no muta el objeto original', () => {
    const data = { input: '5' }
    coerceNumericFields(data, ['input'])

    expect(data.input).toBe('5')
  })
})
