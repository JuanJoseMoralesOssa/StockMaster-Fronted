/**
 * Pruebas de integración – KardexService
 *
 * El kardex es de solo lectura (append-only): se prueban las lecturas paginadas
 * y por id; crear/editar/eliminar y getAll() están bloqueados (lanzan error).
 */
import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import { kardexService } from '../KardexService'
import type Kardex from '../../types/Kardex'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const KARDEX_1: Kardex = { id: 1, date: '2026-01-10T00:00:00.000Z', input: 100, output: 0, balance: 100, operation: 1, productId: 1, sourceKind: 'purchase', sourceId: 7, sourceDetailId: 70, userId: 1 }
const KARDEX_2: Kardex = { id: 2, date: '2026-01-15T00:00:00.000Z', input: 0, output: 30, balance: 70, operation: 3, productId: 1, sourceKind: 'payment', sourceId: 8, sourceDetailId: 80, userId: 1 }
const KARDEXES = [KARDEX_1, KARDEX_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(httpClient) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET (lecturas permitidas)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Escritura bloqueada (append-only): el backend devuelve 405 y no expone /all,
// así que el servicio bloquea estas operaciones en cliente.
// ─────────────────────────────────────────────────────────────────────────────
describe('KardexService – escritura bloqueada (append-only)', () => {
  it('getAll(), create(), update(), updatePartial() y delete() lanzan error', async () => {
    await expect(kardexService.getAll()).rejects.toThrow()
    await expect(kardexService.create()).rejects.toThrow()
    await expect(kardexService.update()).rejects.toThrow()
    await expect(kardexService.updatePartial()).rejects.toThrow()
    await expect(kardexService.delete()).rejects.toThrow()
  })
})
