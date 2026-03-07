/**
 * Pruebas de integración – PurchaseDetailsService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { purchaseDetailsService } from '../PurchaseDetailsService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const DETAIL_1 = { id: 1, weight_kg: 50, purchaseId: 1, productId: 1, personId: 1 }
const DETAIL_2 = { id: 2, weight_kg: 75, purchaseId: 1, productId: 2, personId: 2 }
const DETAILS = [DETAIL_1, DETAIL_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseDetailsService – getAll()', () => {
  it('retorna un array de detalles de compra con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/purchase-details/all`).reply(200, DETAILS)

    const result = await purchaseDetailsService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('weight_kg')
    expect(result[0]).toHaveProperty('purchaseId')
    expect(result[0]).toHaveProperty('productId')
    expect(result[0]).toHaveProperty('personId')
  })

  it('retorna array vacío cuando no hay detalles', async () => {
    mock.onGet(`${BASE}/purchase-details/all`).reply(200, [])

    const result = await purchaseDetailsService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error si el servidor responde 500', async () => {
    mock.onGet(`${BASE}/purchase-details/all`).reply(500)

    await expect(purchaseDetailsService.getAll()).rejects.toThrow()
  })
})

describe('PurchaseDetailsService – getPaginated()', () => {
  it('retorna detalles de compra paginados con estructura correcta', async () => {
    mock.onGet(`${BASE}/purchase-details?page=1&limit=10`).reply(200, paginated(DETAILS))

    const result = await purchaseDetailsService.getPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.count).toBe(2)
  })
})

describe('PurchaseDetailsService – getById()', () => {
  it('retorna un detalle de compra por su id', async () => {
    mock.onGet(`${BASE}/purchase-details/1`).reply(200, DETAIL_1)

    const result = await purchaseDetailsService.getById(1)

    expect(result.id).toBe(1)
    expect(result.weight_kg).toBe(50)
  })

  it('lanza error si el detalle no existe (404)', async () => {
    mock.onGet(`${BASE}/purchase-details/999`).reply(404, { message: 'No encontrado' })

    await expect(purchaseDetailsService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseDetailsService – delete()', () => {
  it('elimina un detalle de compra por su id', async () => {
    mock.onDelete(`${BASE}/purchase-details/1`).reply(204)

    await expect(purchaseDetailsService.delete(1)).resolves.toBeUndefined()
  })

  it('lanza error al eliminar un detalle inexistente (404)', async () => {
    mock.onDelete(`${BASE}/purchase-details/999`).reply(404)

    await expect(purchaseDetailsService.delete(999)).rejects.toThrow()
  })

  it('lanza error si el servidor falla al eliminar (500)', async () => {
    mock.onDelete(`${BASE}/purchase-details/1`).reply(500)

    await expect(purchaseDetailsService.delete(1)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseDetailsService – update() PUT', () => {
  it('actualiza un detalle de compra y retorna los datos actualizados', async () => {
    const updated = { id: 1, weight_kg: 60, purchaseId: 1, productId: 1, personId: 1 }
    mock.onPut(`${BASE}/purchase-details/1`).reply(200, updated)

    const result = await purchaseDetailsService.update(1, { ...updated })

    expect(result.weight_kg).toBe(60)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/purchase-details/1`).reply(200, DETAIL_1)

    await purchaseDetailsService.update(1, { ...DETAIL_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('PurchaseDetailsService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el peso de un detalle de compra', async () => {
    mock.onPatch(`${BASE}/purchase-details/1`).reply(200, { ...DETAIL_1, weight_kg: 85 })

    const result = await purchaseDetailsService.updatePartial(1, { weight_kg: 85 })

    expect(result.weight_kg).toBe(85)
  })

  it('lanza error en PATCH si el detalle no existe (404)', async () => {
    mock.onPatch(`${BASE}/purchase-details/999`).reply(404)

    await expect(purchaseDetailsService.updatePartial(999, { weight_kg: 10 })).rejects.toThrow()
  })
})
