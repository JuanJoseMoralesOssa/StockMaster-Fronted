/**
 * Pruebas de integración – ExpenseService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { expenseService } from '../ExpenseService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const EXPENSE_1 = { id: 1, total_kg: 80, date: '2026-01-20T08:00:00.000Z' }
const EXPENSE_2 = { id: 2, total_kg: 60, date: '2026-02-10T11:00:00.000Z' }
const EXPENSES = [EXPENSE_1, EXPENSE_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseService – getAll()', () => {
  it('retorna un array de gastos con campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/expenses/all`).reply(200, EXPENSES)

    const result = await expenseService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('date')
    expect(result[0]).toHaveProperty('total_kg')
  })

  it('retorna array vacío cuando no hay gastos', async () => {
    mock.onGet(`${BASE}/expenses/all`).reply(200, [])

    const result = await expenseService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error en timeout (error simulado de red)', async () => {
    mock.onGet(`${BASE}/expenses/all`).timeout()

    await expect(expenseService.getAll()).rejects.toThrow()
  })
})

describe('ExpenseService – getPaginated()', () => {
  it('retorna gastos paginados con estructura correcta', async () => {
    mock.onGet(`${BASE}/expenses?page=1&limit=10`).reply(200, paginated(EXPENSES))

    const result = await expenseService.getPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.hasNext).toBe(false)
    expect(result.data[0]).toHaveProperty('total_kg')
  })

  it('lanza error si el servidor responde 500', async () => {
    mock.onGet(`${BASE}/expenses?page=1&limit=10`).reply(500)

    await expect(expenseService.getPaginated()).rejects.toThrow()
  })
})

describe('ExpenseService – getById()', () => {
  it('retorna un gasto por su id', async () => {
    mock.onGet(`${BASE}/expenses/1`).reply(200, EXPENSE_1)

    const result = await expenseService.getById(1)

    expect(result.id).toBe(1)
    expect(result.total_kg).toBe(80)
  })

  it('lanza error si el gasto no existe (404)', async () => {
    mock.onGet(`${BASE}/expenses/999`).reply(404, { message: 'Gasto no encontrado' })

    await expect(expenseService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseService – delete()', () => {
  it('elimina un gasto por su id', async () => {
    mock.onDelete(`${BASE}/expenses/1`).reply(204)

    await expect(expenseService.delete(1)).resolves.toBeUndefined()
  })

  it('lanza error en fallo de red al eliminar', async () => {
    mock.onDelete(`${BASE}/expenses/1`).networkError()

    await expect(expenseService.delete(1)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseService – update() PUT', () => {
  it('actualiza un gasto y retorna los datos actualizados', async () => {
    const updated = { id: 1, date: '2026-02-01T00:00:00.000Z', total_kg: 90 }
    mock.onPut(`${BASE}/expenses/1`).reply(200, updated)

    const result = await expenseService.update(1, { ...updated })

    expect(result.total_kg).toBe(90)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/expenses/1`).reply(200, EXPENSE_1)

    await expenseService.update(1, { ...EXPENSE_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('ExpenseService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el total_kg de un gasto', async () => {
    mock.onPatch(`${BASE}/expenses/1`).reply(200, { ...EXPENSE_1, total_kg: 55 })

    const result = await expenseService.updatePartial(1, { total_kg: 55 })

    expect(result.total_kg).toBe(55)
  })

  it('lanza error en PATCH si el gasto no existe (404)', async () => {
    mock.onPatch(`${BASE}/expenses/999`).reply(404)

    await expect(expenseService.updatePartial(999, { total_kg: 10 })).rejects.toThrow()
  })
})
