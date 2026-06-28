/**
 * Pruebas de integración – PaymentService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import { paymentService } from '../PaymentService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const PAYMENT_1 = { id: 1, version: 6, total_kg: 80, date: '2026-01-20T08:00:00.000Z' }
const PAYMENT_2 = { id: 2, version: 1, total_kg: 60, date: '2026-02-10T11:00:00.000Z' }
const PAYMENTS = [PAYMENT_1, PAYMENT_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(httpClient) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('PaymentService – getAll()', () => {
  it('retorna un array de pagos con campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/payments/all`).reply(200, PAYMENTS)

    const result = await paymentService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('date')
    expect(result[0]).toHaveProperty('total_kg')
  })

  it('retorna array vacío cuando no hay pagos', async () => {
    mock.onGet(`${BASE}/payments/all`).reply(200, [])

    const result = await paymentService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error en timeout (error simulado de red)', async () => {
    mock.onGet(`${BASE}/payments/all`).timeout()

    await expect(paymentService.getAll()).rejects.toThrow()
  })
})

describe('PaymentService – getPaginated()', () => {
  it('retorna pagos paginados con estructura correcta', async () => {
    mock.onGet(`${BASE}/payments?page=1&limit=10`).reply(200, paginated(PAYMENTS))

    const result = await paymentService.getPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.hasNext).toBe(false)
    expect(result.data[0]).toHaveProperty('total_kg')
  })

  it('lanza error si el servidor responde 500', async () => {
    mock.onGet(`${BASE}/payments?page=1&limit=10`).reply(500)

    await expect(paymentService.getPaginated()).rejects.toThrow()
  })
})

describe('PaymentService – getById()', () => {
  it('retorna un pago por su id', async () => {
    mock.onGet(`${BASE}/payments/1`).reply(200, PAYMENT_1)

    const result = await paymentService.getById(1)

    expect(result.id).toBe(1)
    expect(result.total_kg).toBe(80)
  })

  it('lanza error si el pago no existe (404)', async () => {
    mock.onGet(`${BASE}/payments/999`).reply(404, { message: 'Pago no encontrado' })

    await expect(paymentService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('PaymentService – delete()', () => {
  it('elimina un pago por su id', async () => {
    mock.onDelete(`${BASE}/payments/1?version=6`).reply(204)

    await expect(paymentService.delete(1, PAYMENT_1)).resolves.toBeUndefined()
  })

  it('lanza error en fallo de red al eliminar', async () => {
    mock.onDelete(`${BASE}/payments/1?version=6`).networkError()

    await expect(paymentService.delete(1, PAYMENT_1)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('PaymentService – update() PUT', () => {
  it('actualiza un pago y retorna los datos actualizados', async () => {
    const updated = { id: 1, date: '2026-02-01T00:00:00.000Z', total_kg: 90 }
    mock.onPut(`${BASE}/payments/1`).reply(200, updated)

    const result = await paymentService.update(1, { ...updated })

    expect(result.total_kg).toBe(90)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/payments/1`).reply(200, PAYMENT_1)

    await paymentService.update(1, { ...PAYMENT_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('PaymentService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el total_kg de un pago', async () => {
    mock.onPatch(`${BASE}/payments/1`).reply(200, { ...PAYMENT_1, total_kg: 55 })

    const result = await paymentService.updatePartial(1, { total_kg: 55 })

    expect(result.total_kg).toBe(55)
  })

  it('lanza error en PATCH si el pago no existe (404)', async () => {
    mock.onPatch(`${BASE}/payments/999`).reply(404)

    await expect(paymentService.updatePartial(999, { total_kg: 10 })).rejects.toThrow()
  })
})
