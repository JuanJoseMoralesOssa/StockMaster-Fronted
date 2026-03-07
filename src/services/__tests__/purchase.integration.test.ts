/**
 * Pruebas de integración – PurchaseService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { purchaseService } from '../PurchaseService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const PURCHASE_1 = { id: 1, total_kg: 200, date: '2026-01-15T10:00:00.000Z' }
const PURCHASE_2 = { id: 2, total_kg: 150, date: '2026-02-01T09:30:00.000Z' }
const PURCHASES = [PURCHASE_1, PURCHASE_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseService – getAll()', () => {
  it('retorna un array de compras con campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/purchases/all`).reply(200, PURCHASES)

    const result = await purchaseService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('date')
    expect(result[0]).toHaveProperty('total_kg')
  })

  it('retorna array vacío si no hay compras', async () => {
    mock.onGet(`${BASE}/purchases/all`).reply(200, [])

    const result = await purchaseService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error en fallo de red', async () => {
    mock.onGet(`${BASE}/purchases/all`).networkError()

    await expect(purchaseService.getAll()).rejects.toThrow()
  })
})

describe('PurchaseService – getPaginated()', () => {
  it('retorna compras paginadas con estructura completa', async () => {
    mock.onGet(`${BASE}/purchases?page=1&limit=10`).reply(200, paginated(PURCHASES))

    const result = await purchaseService.getPaginated(1, 10)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('totalPages')
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toHaveProperty('date')
    expect(result.data[0]).toHaveProperty('total_kg')
  })

  it('retorna hasPrevious = true cuando se estás en página 2', async () => {
    mock.onGet(`${BASE}/purchases?page=2&limit=10`).reply(200, { ...paginated(PURCHASES, 2, 10), hasPrevious: true })

    const result = await purchaseService.getPaginated(2, 10)

    expect(result.hasPrevious).toBe(true)
    expect(result.page).toBe(2)
  })
})

describe('PurchaseService – getById()', () => {
  it('retorna una compra con su id y campos correctos', async () => {
    mock.onGet(`${BASE}/purchases/1`).reply(200, PURCHASE_1)

    const result = await purchaseService.getById(1)

    expect(result).toHaveProperty('id', 1)
    expect(result).toHaveProperty('total_kg', 200)
  })

  it('lanza error si la compra no existe (404)', async () => {
    mock.onGet(`${BASE}/purchases/999`).reply(404, { message: 'Compra no encontrada' })

    await expect(purchaseService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseService – delete()', () => {
  it('elimina una compra por su id', async () => {
    mock.onDelete(`${BASE}/purchases/1`).reply(204)

    await expect(purchaseService.delete(1)).resolves.toBeUndefined()
  })

  it('lanza error si la compra no existe al eliminar (404)', async () => {
    mock.onDelete(`${BASE}/purchases/999`).reply(404, { message: 'Compra no encontrada' })

    await expect(purchaseService.delete(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseService – update() PUT', () => {
  it('actualiza una compra y retorna los datos actualizados', async () => {
    const updated = { id: 1, date: '2026-03-01T00:00:00.000Z', total_kg: 300 }
    mock.onPut(`${BASE}/purchases/1`).reply(200, updated)

    const result = await purchaseService.update(1, { ...updated })

    expect(result.date).toBe('2026-03-01T00:00:00.000Z')
    expect(result.total_kg).toBe(300)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/purchases/1`).reply(200, PURCHASE_1)

    await purchaseService.update(1, { ...PURCHASE_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseService – updatePartial() PATCH', () => {
  it('actualiza parcialmente la fecha de una compra', async () => {
    const newDate = '2026-04-01T00:00:00.000Z'
    mock.onPatch(`${BASE}/purchases/1`).reply(200, { ...PURCHASE_1, date: newDate })

    const result = await purchaseService.updatePartial(1, { date: newDate })

    expect(result.date).toBe(newDate)
  })

  it('lanza error en PATCH si la compra no existe (404)', async () => {
    mock.onPatch(`${BASE}/purchases/999`).reply(404)

    await expect(purchaseService.updatePartial(999, { total_kg: 10 })).rejects.toThrow()
  })
})
