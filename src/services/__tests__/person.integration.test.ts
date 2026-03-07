/**
 * Pruebas de integración – PersonService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { personService } from '../PersonService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const PERSON_1 = { id: 1, name: 'Juan García' }
const PERSON_2 = { id: 2, name: 'María López' }
const PEOPLE = [PERSON_1, PERSON_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('PersonService – getAll()', () => {
  it('retorna un array de personas con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/people/all`).reply(200, PEOPLE)

    const result = await personService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0].name).toBe('Juan García')
  })

  it('retorna array vacío cuando no hay personas', async () => {
    mock.onGet(`${BASE}/people/all`).reply(200, [])

    const result = await personService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error en fallo de red', async () => {
    mock.onGet(`${BASE}/people/all`).networkError()

    await expect(personService.getAll()).rejects.toThrow()
  })
})

describe('PersonService – getPaginated()', () => {
  it('retorna personas paginadas con estructura correcta', async () => {
    mock.onGet(`${BASE}/people?page=1&limit=10`).reply(200, paginated(PEOPLE))

    const result = await personService.getAllPaginated(1, 10)

    expect(result.data).toHaveLength(2)
    expect(result.count).toBe(2)
    expect(result.data[0]).toHaveProperty('name')
  })

  it('lanza error cuando el servidor responde 401', async () => {
    mock.onGet(`${BASE}/people?page=1&limit=10`).reply(401, { message: 'No autorizado' })

    await expect(personService.getAllPaginated()).rejects.toThrow()
  })
})

describe('PersonService – getById()', () => {
  it('retorna una persona por su id', async () => {
    mock.onGet(`${BASE}/people/2`).reply(200, PERSON_2)

    const result = await personService.getById(2)

    expect(result).toHaveProperty('id', 2)
    expect(result).toHaveProperty('name', 'María López')
  })

  it('lanza error cuando la persona no existe (404)', async () => {
    mock.onGet(`${BASE}/people/999`).reply(404, { message: 'No encontrado' })

    await expect(personService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('PersonService – delete()', () => {
  it('envía DELETE al endpoint correcto y resuelve sin valor', async () => {
    mock.onDelete(`${BASE}/people/1`).reply(204)

    await expect(personService.delete(1)).resolves.toBeUndefined()
    expect(mock.history.delete[0].url).toContain('/people/1')
  })

  it('lanza error si la persona no existe al eliminar (404)', async () => {
    mock.onDelete(`${BASE}/people/999`).reply(404, { message: 'No encontrado' })

    await expect(personService.delete(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('PersonService – update() PUT', () => {
  it('actualiza una persona y retorna los datos actualizados', async () => {
    const updated = { id: 1, name: 'Juan García Actualizado' }
    mock.onPut(`${BASE}/people/1`).reply(200, updated)

    const result = await personService.update(1, { ...updated })

    expect(result.name).toBe('Juan García Actualizado')
  })

  it('elimina el id del payload en el PUT', async () => {
    mock.onPut(`${BASE}/people/1`).reply(200, PERSON_1)

    await personService.update(1, { ...PERSON_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('PersonService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el nombre de una persona', async () => {
    mock.onPatch(`${BASE}/people/1`).reply(200, { id: 1, name: 'Nombre Nuevo' })

    const result = await personService.updatePartial(1, { name: 'Nombre Nuevo' })

    expect(result.name).toBe('Nombre Nuevo')
  })

  it('lanza error en PATCH si el recurso no existe (404)', async () => {
    mock.onPatch(`${BASE}/people/999`).reply(404, { message: 'No encontrado' })

    await expect(personService.updatePartial(999, { name: 'X' })).rejects.toThrow()
  })
})
