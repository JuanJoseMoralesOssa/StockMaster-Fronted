/**
 * Pruebas de integración – ExpenseDetailsService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import { expenseDetailsService } from '../ExpenseDetailsService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const DETAIL_1 = { id: 1, weight_kg: 40, expenseId: 1, productId: 1, personId: 1 }
const DETAIL_2 = { id: 2, weight_kg: 30, expenseId: 1, productId: 2, personId: 2 }
const DETAILS = [DETAIL_1, DETAIL_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(httpClient) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseDetailsService – getAll()', () => {
  it('retorna un array de detalles de gasto con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/expense-details/all`).reply(200, DETAILS)

    const result = await expenseDetailsService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('weight_kg')
    expect(result[0]).toHaveProperty('expenseId')
    expect(result[0]).toHaveProperty('productId')
    expect(result[0]).toHaveProperty('personId')
  })

  it('retorna array vacío cuando no hay detalles', async () => {
    mock.onGet(`${BASE}/expense-details/all`).reply(200, [])

    const result = await expenseDetailsService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error en fallo de red', async () => {
    mock.onGet(`${BASE}/expense-details/all`).networkError()

    await expect(expenseDetailsService.getAll()).rejects.toThrow()
  })
})

describe('ExpenseDetailsService – getPaginated()', () => {
  it('retorna detalles de gasto paginados con estructura correcta', async () => {
    mock.onGet(`${BASE}/expense-details?page=1&limit=10`).reply(200, paginated(DETAILS))

    const result = await expenseDetailsService.getPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.count).toBe(2)
  })
})

describe('ExpenseDetailsService – getById()', () => {
  it('retorna un detalle de gasto por su id', async () => {
    mock.onGet(`${BASE}/expense-details/1`).reply(200, DETAIL_1)

    const result = await expenseDetailsService.getById(1)

    expect(result.id).toBe(1)
    expect(result.weight_kg).toBe(40)
  })

  it('lanza error si el detalle no existe (404)', async () => {
    mock.onGet(`${BASE}/expense-details/999`).reply(404, { message: 'No encontrado' })

    await expect(expenseDetailsService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseDetailsService – delete()', () => {
  it('elimina un detalle de gasto por su id', async () => {
    mock.onDelete(`${BASE}/expense-details/1`).reply(204)

    await expect(expenseDetailsService.delete(1)).resolves.toBeUndefined()
  })

  it('lanza error al eliminar un detalle inexistente (404)', async () => {
    mock.onDelete(`${BASE}/expense-details/999`).reply(404)

    await expect(expenseDetailsService.delete(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseDetailsService – update() PUT', () => {
  it('actualiza un detalle de gasto y retorna los datos actualizados', async () => {
    const updated = { id: 1, weight_kg: 45, expenseId: 1, productId: 1, personId: 1 }
    mock.onPut(`${BASE}/expense-details/1`).reply(200, updated)

    const result = await expenseDetailsService.update(1, { ...updated })

    expect(result.weight_kg).toBe(45)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/expense-details/1`).reply(200, DETAIL_1)

    await expenseDetailsService.update(1, { ...DETAIL_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseDetailsService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el peso de un detalle de gasto', async () => {
    mock.onPatch(`${BASE}/expense-details/2`).reply(200, { ...DETAIL_2, weight_kg: 35 })

    const result = await expenseDetailsService.updatePartial(2, { weight_kg: 35 })

    expect(result.weight_kg).toBe(35)
  })

  it('lanza error en PATCH si hay error de red', async () => {
    mock.onPatch(`${BASE}/expense-details/2`).networkError()

    await expect(expenseDetailsService.updatePartial(2, { weight_kg: 10 })).rejects.toThrow()
  })

  it('lanza error en PATCH si el detalle no existe (404)', async () => {
    mock.onPatch(`${BASE}/expense-details/999`).reply(404)

    await expect(expenseDetailsService.updatePartial(999, { weight_kg: 5 })).rejects.toThrow()
  })
})
