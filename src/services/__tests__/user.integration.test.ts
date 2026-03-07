/**
 * Pruebas de integración – UserService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { userService } from '../User'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const USER_1 = { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'admin' }
const USER_2 = { id: 2, name: 'Regular User', email: 'user@test.com', role: 'user' }
const USERS = [USER_1, USER_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService – getAll()', () => {
  it('retorna un array de usuarios con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/users/all`).reply(200, USERS)

    const result = await userService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('email')
    expect(result[0]).toHaveProperty('role')
  })

  it('no expone contraseñas en la respuesta', async () => {
    mock.onGet(`${BASE}/users/all`).reply(200, USERS)

    const result = await userService.getAll()

    result.forEach((user) => {
      expect(user).not.toHaveProperty('password')
    })
  })

  it('lanza error cuando el servidor responde 403 (sin permisos)', async () => {
    mock.onGet(`${BASE}/users/all`).reply(403, { message: 'Acceso denegado' })

    await expect(userService.getAll()).rejects.toThrow()
  })
})

describe('UserService – getPaginated()', () => {
  it('retorna usuarios paginados con estructura completa', async () => {
    mock.onGet(`${BASE}/users?page=1&limit=10`).reply(200, paginated(USERS))

    const result = await userService.getAllPaginated(1, 10)

    expect(result).toHaveProperty('data')
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toHaveProperty('email')
    expect(result.data[0]).toHaveProperty('role')
  })

  it('lanza error si el servidor responde 401 (no autenticado)', async () => {
    mock.onGet(`${BASE}/users?page=1&limit=10`).reply(401, { message: 'No autenticado' })

    await expect(userService.getAllPaginated()).rejects.toThrow()
  })
})

describe('UserService – getById()', () => {
  it('retorna un usuario por su id', async () => {
    mock.onGet(`${BASE}/users/1`).reply(200, USER_1)

    const result = await userService.getById(1)

    expect(result.id).toBe(1)
    expect(result.email).toBe('admin@test.com')
    expect(result.role).toBe('admin')
  })

  it('lanza error si el usuario no existe (404)', async () => {
    mock.onGet(`${BASE}/users/999`).reply(404, { message: 'Usuario no encontrado' })

    await expect(userService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService – delete()', () => {
  it('elimina un usuario por su id', async () => {
    mock.onDelete(`${BASE}/users/2`).reply(204)

    await expect(userService.delete(2)).resolves.toBeUndefined()
  })

  it('lanza error si el usuario no existe al eliminar (404)', async () => {
    mock.onDelete(`${BASE}/users/999`).reply(404, { message: 'Usuario no encontrado' })

    await expect(userService.delete(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService – update() PUT', () => {
  it('actualiza un usuario y retorna los datos sin contraseña', async () => {
    const updated = { id: 1, name: 'Admin Renombrado', email: 'admin@test.com', role: 'admin' }
    mock.onPut(`${BASE}/users/1`).reply(200, updated)

    const result = await userService.update(1, { ...updated })

    expect(result.name).toBe('Admin Renombrado')
    expect(result).not.toHaveProperty('password')
  })

  it('elimina el id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/users/1`).reply(200, USER_1)

    await userService.update(1, { ...USER_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('UserService – updatePartial() PATCH', () => {
  it('actualiza parcialmente el rol de un usuario', async () => {
    mock.onPatch(`${BASE}/users/2`).reply(200, { ...USER_2, role: 'moderator' })

    const result = await userService.updatePartial(2, { role: 'moderator' })

    expect(result.role).toBe('moderator')
    expect(mock.history.patch).toHaveLength(1)
  })

  it('lanza error en PATCH si el usuario no existe (404)', async () => {
    mock.onPatch(`${BASE}/users/999`).reply(404)

    await expect(userService.updatePartial(999, { role: 'user' })).rejects.toThrow()
  })
})
