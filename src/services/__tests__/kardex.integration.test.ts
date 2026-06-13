/**
 * Pruebas de integración – KardexService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import { kardexService } from '../KardexService'
import type Kardex from '../../types/Kardex'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const KARDEX_1: Kardex = { id: 1, date: '2026-01-10T00:00:00.000Z', input: 100, output: 0, balance: 100, operation: 1, productId: 1, sourceKind: 'purchase', sourceId: 7, sourceDetailId: 70, userId: 1 }
const KARDEX_2: Kardex = { id: 2, date: '2026-01-15T00:00:00.000Z', input: 0, output: 30, balance: 70, operation: 3, productId: 1, sourceKind: 'expense', sourceId: 8, sourceDetailId: 80, userId: 1 }
const KARDEXES = [KARDEX_1, KARDEX_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(httpClient) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('KardexService – getAll()', () => {
  it('retorna un array de kardex con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/kardexes/all`).reply(200, KARDEXES)

    const result = await kardexService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('date')
    expect(result[0]).toHaveProperty('input')
    expect(result[0]).toHaveProperty('output')
    expect(result[0]).toHaveProperty('balance')
    expect(result[0]).toHaveProperty('productId')
  })

  it('retorna array vacío cuando no hay registros', async () => {
    mock.onGet(`${BASE}/kardexes/all`).reply(200, [])

    const result = await kardexService.getAll()

    expect(result).toHaveLength(0)
  })
})

describe('KardexService – getPaginated()', () => {
  it('retorna kardex paginado con estructura correcta', async () => {
    mock.onGet(new RegExp(`${BASE}/kardexes\\?`)).reply(200, paginated(KARDEXES))

    const result = await kardexService.getAllPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toHaveProperty('balance')
    expect(result.data[0]).toHaveProperty('operation')
    expect(result.data[0]).toHaveProperty('sourceKind')
    expect(result.data[0]).not.toHaveProperty('balance_record')
  })

  it('lanza error si el servidor responde 500', async () => {
    mock.onGet(new RegExp(`${BASE}/kardexes\\?`)).reply(500)

    await expect(kardexService.getAllPaginated()).rejects.toThrow()
  })
})

describe('KardexService – getById()', () => {
  it('retorna un registro kardex por su id', async () => {
    mock.onGet(`${BASE}/kardexes/1`).reply(200, KARDEX_1)

    const result = await kardexService.getById(1)

    expect(result.id).toBe(1)
    expect(result.input).toBe(100)
    expect(result.balance).toBe(100)
  })

  it('lanza error si el registro no existe (404)', async () => {
    mock.onGet(`${BASE}/kardexes/999`).reply(404, { message: 'No encontrado' })

    await expect(kardexService.getById(999)).rejects.toThrow()
  })
})

describe('KardexService – getKardexByProducts()', () => {
  it('retorna kardex filtrados por producto', async () => {
    mock.onGet(new RegExp(`${BASE}/kardexes`)).reply(200, KARDEXES)

    const result = await kardexService.getKardexByProducts()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('KardexService – delete()', () => {
  it('elimina un registro kardex por su id', async () => {
    mock.onDelete(`${BASE}/kardexes/1`).reply(204)

    await expect(kardexService.delete(1)).resolves.toBeUndefined()
  })

  it('lanza error si el registro no existe al eliminar (404)', async () => {
    mock.onDelete(`${BASE}/kardexes/999`).reply(404)

    await expect(kardexService.delete(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('KardexService – update() PUT', () => {
  it('actualiza un registro kardex y retorna los datos', async () => {
    const updated = { ...KARDEX_1, input: 150, balance: 150 }
    mock.onPut(`${BASE}/kardexes/1`).reply(200, updated)

    const result = await kardexService.update(1, { ...updated })

    expect(result.input).toBe(150)
    expect(result.balance).toBe(150)
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/kardexes/1`).reply(200, KARDEX_1)

    await kardexService.update(1, { ...KARDEX_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('KardexService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el balance y output de un kardex', async () => {
    mock.onPatch(`${BASE}/kardexes/1`).reply(200, { ...KARDEX_1, output: 20, balance: 80 })

    const result = await kardexService.updatePartial(1, { output: 20, balance: 80 })

    expect(result.output).toBe(20)
    expect(result.balance).toBe(80)
  })

  it('lanza error en PATCH si el registro no existe (404)', async () => {
    mock.onPatch(`${BASE}/kardexes/999`).reply(404)

    await expect(kardexService.updatePartial(999, { balance: 0 })).rejects.toThrow()
  })
})
