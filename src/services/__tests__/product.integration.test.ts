/**
 * Pruebas de integración – ProductService
 *
 * Cubre todos los métodos del servicio: GET, DELETE, PUT, PATCH
 * El backend se simula con axios-mock-adapter para no depender
 * de que el servidor esté corriendo.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { productService } from '../ProductService'

const BASE = 'http://127.0.0.1:3000'

// ── Datos de prueba ──────────────────────────────────────────────────────────
const PRODUCT_1 = { id: 1, name: 'Producto A', stock: 50 }
const PRODUCT_2 = { id: 2, name: 'Producto B', stock: 120 }
const PRODUCTS = [PRODUCT_1, PRODUCT_2]

function paginated<T>(data: T[], page = 1, limit = 10) {
  return { count: data.length, data, page, limit, totalPages: Math.ceil(data.length / limit), hasNext: false, hasPrevious: false }
}

// ── Fixtures del mock ────────────────────────────────────────────────────────
let mock: MockAdapter
beforeEach(() => { mock = new MockAdapter(axios) })
afterEach(() => { mock.restore() })

// ─────────────────────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────────────────────
describe('ProductService – getAll()', () => {
  it('retorna un array de productos con los campos requeridos para la tabla', async () => {
    mock.onGet(`${BASE}/products/all`).reply(200, PRODUCTS)

    const result = await productService.getAll()

    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0].name).toBe('Producto A')
  })

  it('retorna array vacío cuando no hay productos', async () => {
    mock.onGet(`${BASE}/products/all`).reply(200, [])

    const result = await productService.getAll()

    expect(result).toHaveLength(0)
  })

  it('lanza error cuando el servidor responde 500', async () => {
    mock.onGet(`${BASE}/products/all`).reply(500, { message: 'Error interno' })

    await expect(productService.getAll()).rejects.toThrow()
  })
})

describe('ProductService – getPaginated()', () => {
  it('retorna respuesta paginada con estructura completa', async () => {
    mock.onGet(`${BASE}/products?page=1&limit=10`).reply(200, paginated(PRODUCTS))

    const result = await productService.getAllPaginated(1, 10)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('count')
    expect(result).toHaveProperty('page', 1)
    expect(result).toHaveProperty('limit', 10)
    expect(result).toHaveProperty('totalPages')
    expect(result).toHaveProperty('hasNext', false)
    expect(result).toHaveProperty('hasPrevious', false)
    expect(result.data).toHaveLength(2)
  })

  it('respeta los parámetros de página y límite enviados', async () => {
    mock.onGet(`${BASE}/products?page=2&limit=5`).reply(200, paginated([PRODUCT_1], 2, 5))

    const result = await productService.getAllPaginated(2, 5)

    expect(result.page).toBe(2)
    expect(result.limit).toBe(5)
  })

  it('retorna hasNext = true cuando existen más páginas', async () => {
    mock.onGet(`${BASE}/products?page=1&limit=10`).reply(200, { ...paginated(PRODUCTS), hasNext: true, totalPages: 3 })

    const result = await productService.getAllPaginated()

    expect(result.hasNext).toBe(true)
  })
})

describe('ProductService – getById()', () => {
  it('retorna un único producto por su id', async () => {
    mock.onGet(`${BASE}/products/1`).reply(200, PRODUCT_1)

    const result = await productService.getById(1)

    expect(result).toHaveProperty('id', 1)
    expect(result).toHaveProperty('name', 'Producto A')
  })

  it('lanza error cuando el producto no existe (404)', async () => {
    mock.onGet(`${BASE}/products/999`).reply(404, { message: 'Not found' })

    await expect(productService.getById(999)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────────────────────
describe('ProductService – delete()', () => {
  it('envía DELETE al endpoint correcto y resuelve sin valor', async () => {
    mock.onDelete(`${BASE}/products/1`).reply(204)

    await expect(productService.delete(1)).resolves.toBeUndefined()
    expect(mock.history.delete[0].url).toContain('/products/1')
  })

  it('lanza error si el producto no existe al eliminar (404)', async () => {
    mock.onDelete(`${BASE}/products/999`).reply(404, { message: 'No encontrado' })

    await expect(productService.delete(999)).rejects.toThrow()
  })

  it('lanza error si el servidor falla al eliminar (500)', async () => {
    mock.onDelete(`${BASE}/products/1`).reply(500, { message: 'Error del servidor' })

    await expect(productService.delete(1)).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT
// ─────────────────────────────────────────────────────────────────────────────
describe('ProductService – update() PUT', () => {
  it('envía PUT con los datos y retorna el producto actualizado', async () => {
    const updated = { id: 1, name: 'Producto Actualizado', stock: 75 }
    mock.onPut(`${BASE}/products/1`).reply(200, updated)

    const result = await productService.update(1, { ...updated })

    expect(result.name).toBe('Producto Actualizado')
    expect(result.stock).toBe(75)
    expect(mock.history.put).toHaveLength(1)
  })

  it('elimina el campo id del payload antes de enviar el PUT', async () => {
    mock.onPut(`${BASE}/products/1`).reply(200, PRODUCT_1)

    await productService.update(1, { ...PRODUCT_1 })

    const payload = JSON.parse(mock.history.put[0].data)
    expect(payload).not.toHaveProperty('id')
  })

  it('lanza error si el servidor responde 422', async () => {
    mock.onPut(`${BASE}/products/1`).reply(422, { message: 'Datos inválidos' })

    await expect(productService.update(1, { id: 1, name: '', stock: -1 })).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────────────────────
describe('ProductService – updatePartial() PATCH', () => {
  it('envía PATCH con campos parciales y retorna el producto actualizado', async () => {
    mock.onPatch(`${BASE}/products/1`).reply(200, { ...PRODUCT_1, stock: 200 })

    const result = await productService.updatePartial(1, { stock: 200 })

    expect(result.stock).toBe(200)
    expect(mock.history.patch).toHaveLength(1)
  })

  it('elimina el campo id del payload antes de enviar el PATCH', async () => {
    mock.onPatch(`${BASE}/products/1`).reply(200, PRODUCT_1)

    await productService.updatePartial(1, { id: 1, stock: 5 } as any)

    const payload = JSON.parse(mock.history.patch[0].data)
    expect(payload).not.toHaveProperty('id')
  })

  it('lanza error si el recurso no existe (404)', async () => {
    mock.onPatch(`${BASE}/products/999`).reply(404, { message: 'No encontrado' })

    await expect(productService.updatePartial(999, { stock: 10 })).rejects.toThrow()
  })
})
