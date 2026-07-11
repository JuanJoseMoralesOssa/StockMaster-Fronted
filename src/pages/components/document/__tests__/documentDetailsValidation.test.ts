import { describe, expect, it } from 'vitest'
import {
  MAX_WEIGHT_KG,
  formatDetailValidationMessage,
  getDetailValidationKey,
  validateDocumentDetails,
} from '../documentDetailsValidation'

/** Fila válida mínima; cada test sobreescribe solo lo que está probando. */
const validRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  productId: 7,
  personId: 3,
  weight_kg: 12,
  ...overrides,
})

describe('validateDocumentDetails', () => {
  it('accepts a complete row', () => {
    const result = validateDocumentDetails([validRow()])

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
    expect(result.message).toBe('')
  })

  // La regresión que motiva estos tests: las columnas numeric(14,3) de Postgres
  // llegan como STRING ("12.000") en las filas que el usuario no editó. Marcarlas
  // en rojo obligaba a re-tipear un peso que ya era válido.
  it('accepts a weight that arrives as a Postgres numeric string', () => {
    const result = validateDocumentDetails([validRow({ weight_kg: '12.000' })])

    expect(result.isValid).toBe(true)
  })

  it.each([
    ['zero', 0],
    ['negative', -1],
    ['empty string', ''],
    ['non-numeric text', 'abc'],
    ['null', null],
    ['undefined', undefined],
  ])('rejects a %s weight', (_name, weight_kg) => {
    const result = validateDocumentDetails([validRow({ weight_kg })])

    expect(result.isValid).toBe(false)
    expect(result.errors['1']).toEqual({ weight: true })
  })

  it('accepts a weight exactly at the maximum', () => {
    const result = validateDocumentDetails([validRow({ weight_kg: MAX_WEIGHT_KG })])

    expect(result.isValid).toBe(true)
  })

  // El tope frena pegados accidentales (códigos de barras, teléfonos) antes de
  // que el backend devuelva un 422 críptico por overflow del numeric(14,3).
  it('rejects a weight above the maximum', () => {
    const result = validateDocumentDetails([validRow({ weight_kg: MAX_WEIGHT_KG + 1 })])

    expect(result.isValid).toBe(false)
    expect(result.errors['1']).toEqual({ weight: true })
  })

  it('reads the product from the relation when the flat id is missing', () => {
    const result = validateDocumentDetails([
      validRow({ productId: undefined, product: { id: 9 } }),
    ])

    expect(result.isValid).toBe(true)
  })

  it('reads the supplier from the relation when the flat id is missing', () => {
    const result = validateDocumentDetails([
      validRow({ personId: undefined, person: { id: 4 } }),
    ])

    expect(result.isValid).toBe(true)
  })

  it.each([
    ['zero', 0],
    ['negative', -3],
    ['undefined', undefined],
  ])('rejects a %s product id', (_name, productId) => {
    const result = validateDocumentDetails([validRow({ productId })])

    expect(result.errors['1']).toEqual({ product: true })
  })

  it('flags every missing field of a row at once', () => {
    const result = validateDocumentDetails([
      { id: 5, productId: 0, personId: 0, weight_kg: 0 },
    ])

    expect(result.errors['5']).toEqual({ product: true, supplier: true, weight: true })
  })

  it('reports each invalid row by its 1-based position', () => {
    const result = validateDocumentDetails([
      validRow({ id: 1 }),
      validRow({ id: 2, weight_kg: 0 }),
      validRow({ id: 3, productId: 0 }),
    ])

    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Fila 2: kg. Fila 3: producto.')
  })
})

describe('getDetailValidationKey', () => {
  it('keys a persisted row by its id', () => {
    expect(getDetailValidationKey({ id: 42 }, 0)).toBe('42')
  })

  it('keys a negative (unsaved) id by its id too', () => {
    expect(getDetailValidationKey({ id: -17 }, 2)).toBe('-17')
  })

  it('falls back to the position when the row has no id', () => {
    expect(getDetailValidationKey({}, 3)).toBe('index-3')
  })
})

describe('formatDetailValidationMessage', () => {
  it('returns an empty string when there are no errors', () => {
    expect(formatDetailValidationMessage({}, [{ id: 1 }])).toBe('')
  })

  it('lists the missing fields of a row in a single sentence', () => {
    const message = formatDetailValidationMessage(
      { '1': { product: true, weight: true } },
      [{ id: 1 }],
    )

    expect(message).toBe('Fila 1: producto, kg.')
  })

  it('ignores fields explicitly marked as valid', () => {
    const message = formatDetailValidationMessage(
      { '1': { product: true, supplier: false } },
      [{ id: 1 }],
    )

    expect(message).toBe('Fila 1: producto.')
  })
})
